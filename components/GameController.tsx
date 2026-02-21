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
  const params = `?genreId=${genreId}`
  return fetch(`/api/track${params}`, { cache: 'no-store' })
    .then(res => {
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
 * Responsabilità:
 * - Tiene gameState (vite, punteggio, status)
 * - Tiene questionPromise: una Promise che rappresenta la domanda corrente
 * - Quando l'utente risponde, crea una nuova Promise e la passa a QuestionView
 *
 * NON gestisce loading né errori:
 * - Loading → Suspense (fallback: GameSkeleton) wrappa QuestionView
 * - Errori  → ErrorBoundary (fallback: GameError) wrappa QuestionView
 *
 * Quando questionPromise cambia, solo QuestionView viene ri-sospeso.
 * L'header (vite + punteggio) rimane visibile durante il caricamento.
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
      const newState = applyGuess(gameState, option.isCorrect)
      setGameState(newState)

      // Aspetta che l'utente veda il feedback prima di caricare la prossima
      if (newState.status === 'playing') {
        setTimeout(nextQuestion, 1500)
      }
    },
    [selectedId, gameState, nextQuestion]
  )

  // ── Fine partita ──────────────────────────────────────────────────────────
  if (gameState.status === 'won') {
    return <Prize score={gameState.score} onRestart={restartGame} />
  }
  if (gameState.status === 'lost') {
    return <GameOver score={gameState.score} onRestart={restartGame} />
  }

  // ── Gioco attivo ──────────────────────────────────────────────────────────
  return (
    <div className="game-board">
      {/*
        L'header è FUORI dal Suspense boundary: vite e punteggio rimangono
        visibili anche mentre la prossima domanda sta caricando.
      */}
      <header className="game-board__header">
        <LivesIndicator lives={gameState.lives} />
        <div
          className="game-board__score"
          aria-label={`Punteggio: ${formatScore(gameState.score)}`}
        >
          <span aria-hidden="true">🎯 {formatScore(gameState.score)}</span>
        </div>
      </header>

      {/*
        ErrorBoundary catcha i rejection delle Promise passate a use().
        Il reset dell'ErrorBoundary + una nuova Promise = retry pulito.
      */}
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
        {/*
          Suspense wrappa solo QuestionView: quando questionPromise cambia
          React sospende solo questo sottoalbero, non l'header.
        */}
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
