'use client'

import { useState, useEffect } from 'react'
import { getTimeMultiplierLabel } from '@/lib/levels'
import type { Level } from '@/lib/levels'
import { RetryButtons } from './RetryButtons'
import { useLocale } from '@/hooks/useLocale'
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
  const { t } = useLocale()
  const [modalOpen, setModalOpen]       = useState(false)
  const [nickname, setNickname]         = useState('')
  const [submitState, setSubmitState]   = useState<SubmitState>('idle')
  const [savedNickname, setSavedNickname] = useState('')

  useEffect(() => {
    if (isVictory || score === 0) return
    const controller = new AbortController()
    fetch(`/api/leaderboard?check=${leaderboardScore}`, { signal: controller.signal })
      .then(r => r.json())
      .then(data => { if (data.eligible !== false) setModalOpen(true) })
      .catch(err => { if (err.name !== 'AbortError') setModalOpen(true) })
    return () => controller.abort()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const closeModal = () => { if (submitState !== 'loading') setModalOpen(false) }

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
        aria-label={
          isVictory
            ? t('gameover.victory.aria')
            : t('gameover.lost.aria', { score })
        }
      >
        <div className={styles.emoji} aria-hidden="true">
          {isVictory ? '👑' : '💀'}
        </div>
        <h2 className={styles.title}>
          {isVictory ? t('home.leaderboard').replace('🏆 ', '') : 'Game Over'}
        </h2>
        <p className={styles.message}>
          {isVictory ? (
            t('gameover.victory.msg')
          ) : (
            <><strong>{score}</strong>{' '}{score === 1 ? t('gameover.lost.one') : t('gameover.lost.many')}</>
          )}
        </p>

        {score > 0 && (
          <div className={styles.breakdown}>
            <div className={styles.row}>
              <span className={styles.rowLabel}>{t('gameover.level')}</span>
              <span className={styles.rowValue}>{level.name} ×{level.multiplier}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.rowLabel}>{t('gameover.speed')}</span>
              <span className={styles.rowValue}>
                {getTimeMultiplierLabel(avgTimeMs)}
                {avgTimeSec && <span className={styles.rowTime}> ({avgTimeSec}s)</span>}
              </span>
            </div>
            <div className={`${styles.row} ${styles.rowTotal}`}>
              <span className={styles.rowLabel}>{t('gameover.total')}</span>
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
            {t('gameover.save')}
          </button>
        )}

        <RetryButtons gameName={gameName} onRestart={onRestart} onArtistSelect={onArtistSelect} />
      </div>

      {modalOpen && (
        <div
          className={styles.overlay}
          role="dialog"
          aria-modal="true"
          aria-label={t('gameover.modal.aria')}
          onClick={closeModal}
        >
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <button
              type="button"
              className={styles.modalClose}
              onClick={closeModal}
              aria-label={t('gameover.modal.close')}
            >
              ✕
            </button>

            {submitState === 'success' ? (
              <div className={styles.saved}>
                <p>{t('gameover.saved', { name: savedNickname }).replace(savedNickname, `__NAME__`).split('__NAME__').map((part, i) => i === 0 ? <span key={i}>{part}<strong>{savedNickname}</strong> <br /></span> : <span key={i}>{part}</span>)}</p>
                <a href="/leaderboard" className={`${btnStyles.btn} ${btnStyles.primary}`}>
                  {t('gameover.view')}
                </a>
              </div>
            ) : (
              <>
                <p className={styles.modalTitle}>{t('gameover.modal.title')}</p>
                <p className={styles.modalScore}>{leaderboardScore} pt</p>
                <div className={styles.nicknameRow}>
                  <div className={styles.nicknameInputWrap}>
                    <p className={styles.nicknameLabel}>{t('gameover.name.label')}</p>
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
                  </div>
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
                  <p className={styles.nicknameError}>{t('gameover.modal.error')}</p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}