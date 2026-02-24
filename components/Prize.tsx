'use client'

import { getPrize } from '@/lib/game-utils'
import { RetryButtons } from './RetryButtons'

interface PrizeProps {
  score: number
  gameName: string
  onRestart: () => void
  onArtistSelect: (artistName: string) => void
}

export function Prize({ score, gameName, onRestart, onArtistSelect }: PrizeProps) {
  const prize = getPrize(score)

  return (
    <div
      className="prize"
      role="status"
      aria-live="assertive"
      aria-label={`Hai vinto! ${prize.message} Punteggio: ${score}`}
    >
      <div className="prize__emoji" aria-hidden="true">{prize.emoji}</div>
      <h2 className="prize__title">Hai vinto!</h2>
      <p className="prize__message">{prize.message}</p>
      <p className="prize__score" aria-hidden="true">
        Punteggio: <strong>{score}</strong>
      </p>
      <RetryButtons
        gameName={gameName}
        onRestart={onRestart}
        onArtistSelect={onArtistSelect}
      />
    </div>
  )
}
