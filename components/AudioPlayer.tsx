'use client'

import { useRef, useState, useEffect, useCallback } from 'react'

interface AudioPlayerProps {
  src: string
  onFirstPlay?: () => void
  /** Secondi finali in cui il volume scende a 0. Default: 4 */
  fadeOutSeconds?: number
}

type LoadState = 'loading' | 'ready' | 'error'

export function AudioPlayer({ src, onFirstPlay, fadeOutSeconds = 4 }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const hasPlayedRef = useRef(false)
  const rafRef = useRef<number | null>(null)

  // Reset completo quando cambia src
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }

    setIsPlaying(false)
    setProgress(0)
    setDuration(0)
    setLoadState('loading')
    hasPlayedRef.current = false
    audio.volume = 1
    audio.load()
  }, [src])

  // Cleanup RAF su unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // RAF loop: gestisce SOLO il volume fadeout, non tocca lo stato React
  const startFadeLoop = useCallback(() => {
    const loop = () => {
      const audio = audioRef.current
      if (!audio || audio.paused) return

      const remaining = audio.duration - audio.currentTime
      if (remaining <= fadeOutSeconds && remaining > 0) {
        audio.volume = Math.max(0, remaining / fadeOutSeconds)
      } else if (remaining > fadeOutSeconds && audio.volume < 1) {
        audio.volume = 1
      }

      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
  }, [fadeOutSeconds])

  const stopFadeLoop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current
    if (!audio || loadState !== 'ready') return

    if (isPlaying) {
      audio.pause()
      return
    }

    audio.volume = 1
    try {
      await audio.play()
      if (!hasPlayedRef.current) {
        hasPlayedRef.current = true
        onFirstPlay?.()
      }
    } catch (err) {
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

  const handleCanPlay = () => {
    setLoadState('ready')
    const audio = audioRef.current
    if (audio) setDuration(audio.duration)
  }

  const handleLoadedMetadata = () => {
    const audio = audioRef.current
    if (audio && audio.duration) setDuration(audio.duration)
  }

  // onTimeUpdate: aggiorna il progresso esattamente come nell'originale che funzionava
  const handleTimeUpdate = () => {
    const audio = audioRef.current
    if (!audio || !audio.duration) return
    setProgress((audio.currentTime / audio.duration) * 100)
  }

  const handlePlay = () => {
    setIsPlaying(true)
    startFadeLoop()
  }

  const handlePause = () => {
    setIsPlaying(false)
    stopFadeLoop()
  }

  const handleEnded = () => {
    setIsPlaying(false)
    stopFadeLoop()
    const audio = audioRef.current
    if (audio) audio.volume = 1
  }

  const handleError = () => {
    setLoadState('error')
    setIsPlaying(false)
    stopFadeLoop()
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
        onPlay={handlePlay}
        onPause={handlePause}
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
