'use client'

import { useRef, useState, useEffect, useCallback } from 'react'

interface AudioPlayerProps {
  src: string
  /** Chiamato quando l'audio inizia a suonare per la prima volta */
  onFirstPlay?: () => void
}

/**
 * Player audio accessibile:
 * - Keyboard: Space/Enter per play/pause
 * - aria-label dinamico che descrive lo stato
 * - Barra di progresso con role="progressbar"
 * - Focus visible per navigazione keyboard
 */
export function AudioPlayer({ src, onFirstPlay }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const hasPlayedRef = useRef(false)

  // Reset quando cambia la sorgente (nuova domanda)
  useEffect(() => {
    setIsPlaying(false)
    setProgress(0)
    setDuration(0)
    hasPlayedRef.current = false
  }, [src])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
      if (!hasPlayedRef.current) {
        hasPlayedRef.current = true
        onFirstPlay?.()
      }
    }
  }, [isPlaying, onFirstPlay])

  // Keyboard: Space e Enter attivano play/pause
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      togglePlay()
    }
  }

  const handleTimeUpdate = () => {
    const audio = audioRef.current
    if (!audio || !audio.duration) return
    setProgress((audio.currentTime / audio.duration) * 100)
  }

  const handleLoadedMetadata = () => {
    const audio = audioRef.current
    if (audio) setDuration(audio.duration)
  }

  const handleEnded = () => setIsPlaying(false)

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const currentTime = duration ? (progress / 100) * duration : 0

  return (
    <div className="audio-player">
      {/* Audio element nativo - nascosto visivamente, presente nel DOM */}
      <audio
        ref={audioRef}
        src={src}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="metadata"
      />

      {/* Pulsante play/pause */}
      <button
        className="audio-player__btn"
        onClick={togglePlay}
        onKeyDown={handleKeyDown}
        aria-label={isPlaying ? 'Metti in pausa' : 'Riproduci estratto'}
        aria-pressed={isPlaying}
        type="button"
      >
        <span className="audio-player__icon" aria-hidden="true">
          {isPlaying ? '⏸' : '▶'}
        </span>
      </button>

      {/* Barra progresso */}
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
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>
    </div>
  )
}
