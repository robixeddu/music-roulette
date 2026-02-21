'use client'

import { useRef, useState, useEffect, useCallback } from 'react'

interface AudioPlayerProps {
  src: string
  onFirstPlay?: () => void
}

type LoadState = 'loading' | 'ready' | 'error'

/**
 * Player audio accessibile e robusto.
 *
 * Problemi risolti rispetto alla versione precedente:
 * - audio.play() ritorna una Promise: va awaited e il rejection va catchato.
 *   Ignorarla causa "Uncaught (in promise) NotSupportedError".
 * - Il pulsante è disabilitato finché il browser non ha caricato
 *   abbastanza dati per riprodurre (evento `canplay`).
 * - Quando src cambia, l'elemento audio viene esplicitamente resettato
 *   con load() prima di qualsiasi tentativo di play.
 */
export function AudioPlayer({ src, onFirstPlay }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const hasPlayedRef = useRef(false)

  // Reset completo quando cambia src
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    setIsPlaying(false)
    setProgress(0)
    setDuration(0)
    setLoadState('loading')
    hasPlayedRef.current = false

    // Forza il browser a ricaricare il nuovo src
    audio.load()
  }, [src])

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current
    if (!audio || loadState !== 'ready') return

    if (isPlaying) {
      audio.pause()
      return
    }

    try {
      await audio.play()
      if (!hasPlayedRef.current) {
        hasPlayedRef.current = true
        onFirstPlay?.()
      }
    } catch (err) {
      // NotSupportedError, NotAllowedError (autoplay policy), ecc.
      // Non crashiamo — mostriamo solo che non è possibile riprodurre
      console.warn('[AudioPlayer] play() failed:', err)
      setLoadState('error')
    }
  }, [isPlaying, loadState, onFirstPlay])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      togglePlay()
    }
  }

  // canplay: il browser ha abbastanza dati per iniziare la riproduzione
  const handleCanPlay = () => {
    setLoadState('ready')
    const audio = audioRef.current
    if (audio) setDuration(audio.duration)
  }

  const handleTimeUpdate = () => {
    const audio = audioRef.current
    if (!audio || !audio.duration) return
    setProgress((audio.currentTime / audio.duration) * 100)
  }

  const handleLoadedMetadata = () => {
    const audio = audioRef.current
    if (audio && audio.duration) setDuration(audio.duration)
  }

  const handleEnded = () => setIsPlaying(false)

  const handleError = () => {
    setLoadState('error')
    setIsPlaying(false)
  }

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const currentTime = duration ? (progress / 100) * duration : 0
  const isDisabled = loadState !== 'ready'

  const btnLabel = loadState === 'loading'
    ? 'Caricamento audio...'
    : loadState === 'error'
    ? 'Audio non disponibile'
    : isPlaying
    ? 'Metti in pausa'
    : 'Riproduci estratto'

  return (
    <div className="audio-player">
      <audio
        ref={audioRef}
        src={src}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onCanPlay={handleCanPlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onError={handleError}
        preload="metadata"
      />

      <button
        className={`audio-player__btn ${isDisabled ? 'audio-player__btn--disabled' : ''}`}
        onClick={togglePlay}
        onKeyDown={handleKeyDown}
        aria-label={btnLabel}
        aria-pressed={isPlaying}
        aria-busy={loadState === 'loading'}
        disabled={isDisabled}
        type="button"
      >
        <span className="audio-player__icon" aria-hidden="true">
          {loadState === 'loading' ? '⏳' : loadState === 'error' ? '✕' : isPlaying ? '⏸' : '▶'}
        </span>
      </button>

      <div className="audio-player__progress-wrap">
        <div
          className="audio-player__progress-bar"
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Progresso: ${formatTime(currentTime)} di ${formatTime(duration)}`}
        >
          <div
            className="audio-player__progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="audio-player__time" aria-hidden="true">
          {loadState === 'error'
            ? 'Preview non disponibile'
            : `${formatTime(currentTime)} / ${formatTime(duration)}`}
        </span>
      </div>
    </div>
  )
}
