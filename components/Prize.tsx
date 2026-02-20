'use client'

import { getPrize } from '@/lib/game-utils'

interface PrizeProps {
  score: number
  onRestart: () => void
}

/**
 * Schermata premio mostrata quando l'utente vince.
 * aria-live="assertive" per annunciare subito ai screen reader.
 */
export function Prize({ score, onRestart }: PrizeProps) {
  const prize = getPrize(score)

  return (
    <div
      className="prize"
      role="status"
      aria-live="assertive"
      aria-label={`Hai vinto! ${prize.message} Punteggio: ${score}`}
    >
      <div className="prize__emoji" aria-hidden="true">
        {prize.emoji}
      </div>
      <h2 className="prize__title">Hai vinto!</h2>
      <p className="prize__message">{prize.message}</p>
      <p className="prize__score" aria-hidden="true">
        Punteggio: <strong>{score}</strong>
      </p>
      <button
        type="button"
        className="btn btn--primary"
        onClick={onRestart}
        autoFocus
      >
        Gioca ancora
      </button>
    </div>
  )
}
