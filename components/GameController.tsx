'use client'

import { useState, useCallback, Suspense } from 'react'
import type { TrackQuestion, TrackOption, GameState } from '@/lib/types'
import { INITIAL_GAME_STATE } from '@/lib/types'
import { applyGuess, formatScore } from '@/lib/game-utils'
import { QuestionView } from './QuestionView'
import { LivesIndicator } from './LivesIndicator'
import { Prize } from './Prize'
import { GameOver } from './GameOver'
import { GameSkeleton } from './GameSkeleton'
import { GameError } from './GameError'
import { ErrorBoundary } from './ErrorBoundary'

function fetchQuestion(genreId: string): Promise<TrackQuestion> {
  return fetch(`/api/track?genreId=${genreId}`, { cache: 'no-store' }).then(res => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
  })
}

interface GameControllerProps {
  firstQuestionPromise: Promise<TrackQuestion>
  genreId: string
}

/**
 * GameController — orchestra lo stato del gioco e le Promise delle domande.
 *
 * Pattern chiave:
 * - gameState (vite/punteggio/status) vive qui
 * - questionPromise è lo stato della domanda corrente
 * - handleSelect usa setGameState(prev => ...) per evitare stale closure
 * - Solo QuestionView si sospende al cambio domanda; l'header rimane visibile
 */
export function GameController({ firstQuestionPromise, genreId }: GameControllerProps) {
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [questionPromise, setQuestionPromise] = useState(firstQuestionPromise)

  const nextQuestion = useCallback(() => {
    setSelectedId(null)
    setQuestionPromise(fetchQuestion(genreId))
  }, [genreId])

  const restartGame = useCallback(() => {
    setGameState(INITIAL_GAME_STATE)
    setSelectedId(null)
    setQuestionPromise(fetchQuestion(genreId))
  }, [genreId])

  const handleSelect = useCallback(
    (option: TrackOption) => {
      if (selectedId !== null) return
      setSelectedId(option.id)
      // Forma funzionale: sempre lo stato più aggiornato, evita stale closure
      setGameState(prev => {
        const newState = applyGuess(prev, option.isCorrect)
        if (newState.status === 'playing') {
          setTimeout(nextQuestion, 1500)
        }
        return newState
      })
    },
    [selectedId, nextQuestion]
  )

  if (gameState.status === 'won') {
    return <Prize score={gameState.score} onRestart={restartGame} />
  }
  if (gameState.status === 'lost') {
    return <GameOver score={gameState.score} onRestart={restartGame} />
  }

  return (
    <div className="game-board">
      {/* Header fuori dal Suspense: vite e punteggio restano visibili durante il caricamento */}
      <header className="game-board__header">
        <LivesIndicator lives={gameState.lives} />
        <div
          className="game-board__score"
          aria-label={`Punteggio: ${formatScore(gameState.score)}`}
        >
          <span aria-hidden="true">🎯 {formatScore(gameState.score)}</span>
        </div>
      </header>

      <ErrorBoundary
        fallback={({ reset }) => (
          <GameError
            onRetry={() => {
              reset()
              setQuestionPromise(fetchQuestion(genreId))
            }}
          />
        )}
      >
        <Suspense fallback={<GameSkeleton />}>
          <QuestionView
            questionPromise={questionPromise}
            selectedId={selectedId}
            onSelect={handleSelect}
          />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
