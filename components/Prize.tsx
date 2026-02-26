'use client'

import { getPrize } from '@/lib/game-utils'
import { getNextLevel } from '@/lib/levels'
import type { Level } from '@/lib/levels'
import { RetryButtons } from './RetryButtons'

interface PrizeProps {
  level: Level
  gameName: string
  onRestart: () => void
  onArtistSelect: (artistName: string) => void
  onAdvanceLevel: () => void
}

export function Prize({
  level,
  gameName,
  onRestart,
  onArtistSelect,
  onAdvanceLevel,
}: PrizeProps) {
  const prize = getPrize(level.name)
  const nextLevel = getNextLevel(level)

  const handleAdvance = () => {
    onAdvanceLevel()
    onRestart()
  }

  return (
    <div
      className="prize"
      role="status"
      aria-live="assertive"
      aria-label={`Livello completato! ${prize.message}`}
    >
      <div className="prize__emoji" aria-hidden="true">{prize.emoji}</div>
      <h2 className="prize__title">Livello completato!</h2>
      <p className="prize__message">{prize.message}</p>

      {nextLevel && (
        <div className="prize__next-level">
          <p className="prize__next-level-label">
            Prossimo livello: <strong>{nextLevel.name}</strong>
            <br />
            <span className="prize__next-level-detail">
              {nextLevel.winScore} risposte · moltiplicatore ×{nextLevel.multiplier}
            </span>
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

      <RetryButtons
        gameName={gameName}
        onRestart={onRestart}
        onArtistSelect={onArtistSelect}
      />
    </div>
  )
}
