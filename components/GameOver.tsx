'use client'

import { useState, useEffect } from 'react'
import { getTimeMultiplierLabel } from '@/lib/levels'
import type { Level } from '@/lib/levels'
import { RetryButtons } from './RetryButtons'
import styles from './GameOver.module.css'
import btnStyles from './Btn.module.css'

interface GameOverProps {
  score: number
  leaderboardScore: number
  avgTimeMs: number | null
  level: Level
  gameName: string
  isVictory: boolean
  onRestart: () => void
  onArtistSelect: (artistName: string) => void
}

type SubmitState = 'idle' | 'loading' | 'success' | 'error'

export function GameOver({
  score, leaderboardScore, avgTimeMs, level, gameName, isVictory, onRestart, onArtistSelect,
}: GameOverProps) {
  const [modalOpen, setModalOpen]         = useState(false)
  const [nickname, setNickname]           = useState('')
  const [submitState, setSubmitState]     = useState<SubmitState>('idle')
  const [savedNickname, setSavedNickname] = useState('')

  // Apre il modal solo su game over (lost) — la vittoria Master apre il modal manualmente
  useEffect(() => {
    if (isVictory || score === 0) return
    const controller = new AbortController()
    fetch(`/api/leaderboard?check=${leaderboardScore}`, { signal: controller.signal })
      .then(r => r.json())
      .then(data => { if (data.eligible !== false) setModalOpen(true) })
      .catch(err => { if (err.name !== 'AbortError') setModalOpen(true) })
    return () => controller.abort()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const closeModal = () => {
    if (submitState === 'loading') return
    setModalOpen(false)
  }

  const handleSubmit = async () => {
    const clean = nickname.trim().slice(0, 12)
    if (!clean) return
    setSubmitState('loading')
    try {
      const res = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: clean, score: leaderboardScore,
          level: level.id, level_name: level.name,
          genre: gameName, avg_time_ms: avgTimeMs,
        }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      if (data.eligible === false) {
        // Qualcuno ha scalzato lo score nel frattempo
        setModalOpen(false)
      } else {
        setSavedNickname(clean.toUpperCase())
        setSubmitState('success')
      }
    } catch {
      setSubmitState('error')
    }
  }

  const avgTimeSec = avgTimeMs !== null ? (avgTimeMs / 1000).toFixed(1) : null

  return (
    <>
      <div
        className={styles.gameOver}
        role="status"
        aria-live="assertive"
        aria-label={isVictory ? 'Hai completato tutti i livelli!' : `Game over. ${score} risposte corrette.`}
      >
        <div className={styles.emoji} aria-hidden="true">{isVictory ? '👑' : '💀'}</div>
        <h2 className={styles.title}>{isVictory ? 'Hall of Fame!' : 'Game Over'}</h2>
        <p className={styles.message}>
          {isVictory
            ? 'Hai completato tutti i livelli. Leggendario.'
            : <><strong>{score}</strong> {score === 1 ? 'risposta corretta' : 'risposte corrette'}.</>
          }
        </p>

        {score > 0 && (
          <div className={styles.breakdown}>
            <div className={styles.row}>
              <span className={styles.rowLabel}>Livello raggiunto</span>
              <span className={styles.rowValue}>{level.name} ×{level.multiplier}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.rowLabel}>Velocità media</span>
              <span className={styles.rowValue}>
                {getTimeMultiplierLabel(avgTimeMs)}
                {avgTimeSec && <span className={styles.rowTime}> ({avgTimeSec}s)</span>}
              </span>
            </div>
            <div className={`${styles.row} ${styles.rowTotal}`}>
              <span className={styles.rowLabel}>Punteggio finale</span>
              <span className={styles.scoreFinal}>{leaderboardScore}</span>
            </div>
          </div>
        )}

        {isVictory && score > 0 && submitState !== 'success' && (
          <button
            type="button"
            className={`${btnStyles.btn} ${btnStyles.primary}`}
            onClick={() => setModalOpen(true)}
          >
            🏆 Salva punteggio
          </button>
        )}

        <RetryButtons gameName={gameName} onRestart={onRestart} onArtistSelect={onArtistSelect} />
      </div>

      {modalOpen && (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Salva punteggio">
          <div className={styles.modal}>
            <button
              type="button"
              className={styles.modalClose}
              onClick={closeModal}
              aria-label="Chiudi"
            >
              ✕
            </button>

            {submitState === 'success' ? (
              <div className={styles.saved}>
                <p><strong>{savedNickname}</strong> salvato in classifica!</p>
                <a href="/leaderboard" className={`${btnStyles.btn} ${btnStyles.primary}`}>
                  Vedi classifica
                </a>
              </div>
            ) : (
              <>
                <p className={styles.modalTitle}>🏆 Sei nella top 50!</p>
                <p className={styles.modalScore}>{leaderboardScore} pt</p>
                <p className={styles.nicknameLabel}>ENTER YOUR NAME</p>
                <div className={styles.nicknameRow}>
                  <input
                    id="nickname-input"
                    type="text"
                    className={styles.nicknameInput}
                    placeholder="_ _ _"
                    value={nickname}
                    onChange={e => setNickname(e.target.value.toUpperCase())}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    maxLength={12}
                    autoComplete="off"
                    style={{ fontSize: '16px' }}
                    disabled={submitState === 'loading'}
                    autoFocus
                  />
                  <button
                    type="button"
                    className={`${btnStyles.btn} ${btnStyles.primary} ${styles.nicknameBtn}`}
                    onClick={handleSubmit}
                    disabled={!nickname.trim() || submitState === 'loading'}
                  >
                    {submitState === 'loading' ? '…' : '→'}
                  </button>
                </div>
                {submitState === 'error' && (
                  <p className={styles.nicknameError}>Errore nel salvataggio. Riprova.</p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}