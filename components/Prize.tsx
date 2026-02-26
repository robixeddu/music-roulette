'use client'

import { useState } from 'react'
import { getPrize } from '@/lib/game-utils'
import { getNextLevel, MAX_LEVEL, getTimeMultiplierLabel } from '@/lib/levels'
import type { Level } from '@/lib/levels'
import { RetryButtons } from './RetryButtons'

interface PrizeProps {
  score: number
  leaderboardScore: number
  avgTimeMs: number | null
  level: Level
  gameName: string
  onRestart: () => void
  onArtistSelect: (artistName: string) => void
  onAdvanceLevel: () => void
}

type SubmitState = 'idle' | 'loading' | 'success' | 'error'

export function Prize({
  score,
  leaderboardScore,
  avgTimeMs,
  level,
  gameName,
  onRestart,
  onArtistSelect,
  onAdvanceLevel,
}: PrizeProps) {
  const prize = getPrize(level.name)
  const nextLevel = getNextLevel(level)

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

  const handleAdvance = () => {
    onAdvanceLevel()
    onRestart()
  }

  const avgTimeSec = avgTimeMs !== null ? (avgTimeMs / 1000).toFixed(1) : null

  return (
    <div
      className="prize"
      role="status"
      aria-live="assertive"
      aria-label={`Hai vinto! ${prize.message}`}
    >
      <div className="prize__emoji" aria-hidden="true">{prize.emoji}</div>
      <h2 className="prize__title">Hai vinto!</h2>
      <p className="prize__message">{prize.message}</p>

      <div className="prize__scores">
        <p className="prize__score-raw" aria-hidden="true">
          {score} risposte corrette
        </p>
        <div className="prize__score-breakdown">
          <span className="prize__score-item">
            livello <strong>×{level.multiplier}</strong>
          </span>
          <span className="prize__score-sep">·</span>
          <span className="prize__score-item">
            tempo {getTimeMultiplierLabel(avgTimeMs)}
            {avgTimeSec && <span className="prize__score-time"> ({avgTimeSec}s avg)</span>}
          </span>
        </div>
        <p className="prize__score-final">
          Punteggio classifica: <strong>{leaderboardScore}</strong>
        </p>
      </div>

      {/* Form salvataggio punteggio */}
      {submitState === 'success' ? (
        <div className="prize__saved">
          <span className="prize__saved-icon" aria-hidden="true">✓</span>
          <p><strong>{savedNickname}</strong> salvato in classifica!</p>
          <a href="/leaderboard" className="btn btn--primary">
            Vedi classifica
          </a>
        </div>
      ) : (
        <div className="prize__nickname-form">
          <label className="prize__nickname-label" htmlFor="nickname-input">
            Salva il tuo punteggio
          </label>
          <div className="prize__nickname-row">
            <input
              id="nickname-input"
              type="text"
              className="prize__nickname-input"
              placeholder="Il tuo nome (max 12)"
              value={nickname}
              onChange={e => setNickname(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              maxLength={12}
              autoComplete="off"
              style={{ fontSize: '16px' }}
              disabled={submitState === 'loading'}
            />
            <button
              type="button"
              className="btn btn--primary prize__nickname-btn"
              onClick={handleSubmit}
              disabled={!nickname.trim() || submitState === 'loading'}
            >
              {submitState === 'loading' ? '…' : '→'}
            </button>
          </div>
          {submitState === 'error' && (
            <p className="prize__nickname-error">Errore nel salvataggio. Riprova.</p>
          )}
        </div>
      )}

      {/* Avanza livello */}
      {nextLevel && (
        <div className="prize__next-level">
          <p className="prize__next-level-label">
            Prossimo livello: <strong>{nextLevel.name}</strong> ({nextLevel.winScore} risposte, ×{nextLevel.multiplier})
          </p>
          <button
            type="button"
            className="btn btn--primary btn--large"
            onClick={handleAdvance}
            autoFocus
          >
            Vai al livello {nextLevel.name} →
          </button>
        </div>
      )}

      {level.id >= MAX_LEVEL && (
        <p className="prize__max-level">Sei al livello massimo! 👑</p>
      )}

      <RetryButtons
        gameName={gameName}
        onRestart={onRestart}
        onArtistSelect={onArtistSelect}
      />
    </div>
  )
}
