'use client'

import { useState } from 'react'
import { getTimeMultiplierLabel } from '@/lib/levels'
import type { Level } from '@/lib/levels'
import { RetryButtons } from './RetryButtons'

interface GameOverProps {
  score: number
  leaderboardScore: number
  avgTimeMs: number | null
  level: Level
  gameName: string
  /** true = ha completato Master, false = vite esaurite */
  isVictory: boolean
  onRestart: () => void
  onArtistSelect: (artistName: string) => void
}

type SubmitState = 'idle' | 'loading' | 'success' | 'error'

export function GameOver({
  score,
  leaderboardScore,
  avgTimeMs,
  level,
  gameName,
  isVictory,
  onRestart,
  onArtistSelect,
}: GameOverProps) {
  const [nickname, setNickname] = useState('')
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [savedNickname, setSavedNickname] = useState('')

  const handleSubmit = async () => {
    const clean = nickname.trim().slice(0, 12)
    if (!clean) return
    setSubmitState('loading')
    try {
      const res = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: clean,
          score: leaderboardScore,
          level: level.id,
          level_name: level.name,
          genre: gameName,
          avg_time_ms: avgTimeMs,
        }),
      })
      if (!res.ok) throw new Error()
      setSavedNickname(clean.toUpperCase())
      setSubmitState('success')
    } catch {
      setSubmitState('error')
    }
  }

  const avgTimeSec = avgTimeMs !== null ? (avgTimeMs / 1000).toFixed(1) : null

  return (
    <div
      className="game-over"
      role="status"
      aria-live="assertive"
      aria-label={isVictory ? 'Hai completato tutti i livelli!' : `Game over. ${score} risposte corrette.`}
    >
      <div className="game-over__emoji" aria-hidden="true">
        {isVictory ? '👑' : '💀'}
      </div>

      <h2 className="game-over__title">
        {isVictory ? 'Hall of Fame!' : 'Game Over'}
      </h2>

      <p className="game-over__message">
        {isVictory
          ? 'Hai completato tutti i livelli. Leggendario.'
          : <>Hai totalizzato <strong>{score}</strong> {score === 1 ? 'risposta corretta' : 'risposte corrette'}.</>
        }
      </p>

      {/* Breakdown punteggio */}
      {score > 0 && (
        <div className="game-over__score-breakdown">
          <div className="game-over__score-row">
            <span className="game-over__score-label">Livello raggiunto</span>
            <span className="game-over__score-value">{level.name} ×{level.multiplier}</span>
          </div>
          <div className="game-over__score-row">
            <span className="game-over__score-label">Velocità media</span>
            <span className="game-over__score-value">
              {getTimeMultiplierLabel(avgTimeMs)}
              {avgTimeSec && <span className="game-over__score-time"> ({avgTimeSec}s)</span>}
            </span>
          </div>
          <div className="game-over__score-row game-over__score-row--total">
            <span className="game-over__score-label">Punteggio finale</span>
            <span className="game-over__score-final">{leaderboardScore}</span>
          </div>
        </div>
      )}

      {/* Form salvataggio — stile arcade "INSERT COIN" */}
      {score > 0 && (
        submitState === 'success' ? (
          <div className="game-over__saved">
            <span className="game-over__saved-icon" aria-hidden="true">✓</span>
            <p><strong>{savedNickname}</strong> salvato in classifica!</p>
            <a href="/leaderboard" className="btn btn--primary">
              Vedi classifica
            </a>
          </div>
        ) : (
          <div className="game-over__nickname-form">
            <p className="game-over__nickname-label">ENTER YOUR NAME</p>
            <div className="game-over__nickname-row">
              <input
                id="nickname-input"
                type="text"
                className="game-over__nickname-input"
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
                className="btn btn--primary game-over__nickname-btn"
                onClick={handleSubmit}
                disabled={!nickname.trim() || submitState === 'loading'}
              >
                {submitState === 'loading' ? '…' : '→'}
              </button>
            </div>
            {submitState === 'error' && (
              <p className="game-over__nickname-error">Errore nel salvataggio. Riprova.</p>
            )}
          </div>
        )
      )}

      <RetryButtons
        gameName={gameName}
        onRestart={onRestart}
        onArtistSelect={onArtistSelect}
      />
    </div>
  )
}
