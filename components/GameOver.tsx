'use client'

import { RetryButtons } from './RetryButtons'

interface GameOverProps {
  score: number
  gameName: string
  onRestart: () => void
  onArtistSelect: (artistName: string) => void
}

export function GameOver({ score, gameName, onRestart, onArtistSelect }: GameOverProps) {
  return (
    <div
      className="game-over"
      role="status"
      aria-live="assertive"
      aria-label={`Game over. Hai totalizzato ${score} punti.`}
    >
      <div className="game-over__emoji" aria-hidden="true">💀</div>
      <h2 className="game-over__title">Game Over</h2>
      <p className="game-over__message">
        Hai totalizzato <strong>{score}</strong>{' '}
        {score === 1 ? 'punto' : 'punti'}. Riprova!
      </p>
      <RetryButtons
        gameName={gameName}
        onRestart={onRestart}
        onArtistSelect={onArtistSelect}
      />
    </div>
  )
}
