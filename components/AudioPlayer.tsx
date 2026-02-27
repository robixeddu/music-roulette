'use client'

import { useRef, useState, useEffect, useCallback, type RefObject } from 'react'
import styles from './AudioPlayer.module.css'

interface AudioPlayerProps {
  src: string
  onFirstPlay?: () => void
  fadeOutSeconds?: number
  playBtnRef?: RefObject<HTMLButtonElement | null>
  autoplay?: boolean
}

type LoadState = 'loading' | 'ready' | 'error'

export function AudioPlayer({ src, onFirstPlay, fadeOutSeconds = 4, playBtnRef, autoplay = false }: AudioPlayerProps) {
  const audioRef      = useRef<HTMLAudioElement>(null)
  const internalBtnRef = useRef<HTMLButtonElement>(null)
  const btnRef = playBtnRef ?? internalBtnRef

  const [isPlaying, setIsPlaying]   = useState(false)
  const [loadState, setLoadState]   = useState<LoadState>('loading')
  const [progress, setProgress]     = useState(0)
  const [duration, setDuration]     = useState(0)
  const hasPlayedRef  = useRef(false)
  const rafRef        = useRef<number | null>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
    setIsPlaying(false); setProgress(0); setDuration(0); setLoadState('loading')
    hasPlayedRef.current = false
    audio.volume = 1
    audio.load()
  }, [src])

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }, [])

  // Autoplay: tenta play() appena l'audio è pronto
  useEffect(() => {
    if (!autoplay) return
    const audio = audioRef.current
    if (!audio) return
    const tryPlay = () => {
      audio.volume = 1
      audio.play().then(() => {
        if (!hasPlayedRef.current) { hasPlayedRef.current = true; onFirstPlay?.() }
      }).catch(() => {
        // Autoplay bloccato dal browser (policy utente) — silenzioso
      })
    }
    if (loadState === 'ready') { tryPlay(); return }
    audio.addEventListener('canplay', tryPlay, { once: true })
    return () => audio.removeEventListener('canplay', tryPlay)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, src])

  const startFadeLoop = useCallback(() => {
    const loop = () => {
      const audio = audioRef.current
      if (!audio || audio.paused) return
      const remaining = audio.duration - audio.currentTime
      if (remaining <= fadeOutSeconds && remaining > 0)
        audio.volume = Math.max(0, remaining / fadeOutSeconds)
      else if (remaining > fadeOutSeconds && audio.volume < 1)
        audio.volume = 1
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
  }, [fadeOutSeconds])

  const stopFadeLoop = useCallback(() => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
  }, [])

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current
    if (!audio || loadState !== 'ready') return
    if (isPlaying) { audio.pause(); return }
    audio.volume = 1
    try {
      await audio.play()
      if (!hasPlayedRef.current) { hasPlayedRef.current = true; onFirstPlay?.() }
    } catch (err) {
      console.warn('[AudioPlayer] play() failed:', err)
      setLoadState('error')
    }
  }, [isPlaying, loadState, onFirstPlay])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); togglePlay() }
  }

  const handleCanPlay = () => {
    setLoadState('ready')
    const audio = audioRef.current
    if (audio) setDuration(audio.duration)
  }

  const handleLoadedMetadata = () => {
    const audio = audioRef.current
    if (audio?.duration) setDuration(audio.duration)
  }

  const handleTimeUpdate = () => {
    const audio = audioRef.current
    if (!audio?.duration) return
    setProgress((audio.currentTime / audio.duration) * 100)
  }

  const handlePlay  = () => { setIsPlaying(true);  startFadeLoop() }
  const handlePause = () => { setIsPlaying(false); stopFadeLoop()  }
  const handleEnded = () => {
    setIsPlaying(false); stopFadeLoop()
    const audio = audioRef.current
    if (audio) audio.volume = 1
  }
  const handleError = () => { setLoadState('error'); setIsPlaying(false); stopFadeLoop() }

  const formatTime = (s: number) => {
    if (!s || isNaN(s)) return '0:00'
    return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`
  }

  const currentTime = duration ? (progress / 100) * duration : 0
  const isDisabled  = loadState !== 'ready'
  const btnLabel    = loadState === 'loading' ? 'Caricamento audio...'
    : loadState === 'error' ? 'Audio non disponibile'
    : isPlaying ? 'Metti in pausa' : 'Riproduci estratto'

  return (
    <div className={styles.player}>
      <audio
        ref={audioRef} src={src} preload="metadata"
        onPlay={handlePlay} onPause={handlePause}
        onCanPlay={handleCanPlay} onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded} onError={handleError}
      />
      <button
        ref={btnRef}
        className={`${styles.btn} ${isDisabled ? styles.btnDisabled : ''}`}
        onClick={togglePlay} onKeyDown={handleKeyDown}
        aria-label={btnLabel} aria-pressed={isPlaying}
        aria-busy={loadState === 'loading'} disabled={isDisabled} type="button"
      >
        <span aria-hidden="true">
          {loadState === 'loading' ? '⏳' : loadState === 'error' ? '✕' : isPlaying ? '⏸' : '▶'}
        </span>
      </button>
      <div className={styles.progressWrap}>
        <div
          className={styles.progressBar}
          role="progressbar"
          aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}
          aria-label={`Progresso: ${formatTime(currentTime)} di ${formatTime(duration)}`}
        >
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>
        <span className={styles.time} aria-hidden="true">
          {loadState === 'error' ? 'Preview non disponibile' : `${formatTime(currentTime)} / ${formatTime(duration)}`}
        </span>
      </div>
    </div>
  )
}