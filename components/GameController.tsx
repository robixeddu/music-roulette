'use client'

import { useState, useCallback, Suspense } from 'react'
import { useRouter } from 'next/navigation'
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

export type GameMode =
  | { type: 'genre'; genreId: string }
  | { type: 'artist'; artistName: string }

function fetchQuestion(mode: GameMode): Promise<TrackQuestion> {
  const param = mode.type === 'artist'
    ? `artistName=${encodeURIComponent(mode.artistName)}`
    : `genreId=${mode.genreId}`
  return fetch(`/api/track?${param}`, { cache: 'no-store' }).then(res => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
  })
}

function getGameName(mode: GameMode): string {
  return mode.type === 'artist' ? mode.artistName : mode.genreId
}

interface GameControllerProps {
  firstQuestionPromise: Promise<TrackQuestion>
  gameMode: GameMode
}

export function GameController({ firstQuestionPromise, gameMode: initialMode }: GameControllerProps) {
  const router = useRouter()
  // gameMode in stato: può cambiare quando l'utente cerca un nuovo artista
  // dalla schermata Prize/GameOver senza navigare
  const [gameMode, setGameMode] = useState<GameMode>(initialMode)
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [questionPromise, setQuestionPromise] = useState(firstQuestionPromise)

  const nextQuestion = useCallback((mode: GameMode) => {
    setSelectedId(null)
    setQuestionPromise(fetchQuestion(mode))
  }, [])

  const restartGame = useCallback(() => {
    setGameState(INITIAL_GAME_STATE)
    setSelectedId(null)
    setQuestionPromise(fetchQuestion(gameMode))
  }, [gameMode])

  const switchToArtist = useCallback((artistName: string) => {
    router.replace(`/game?artistName=${encodeURIComponent(artistName)}`)
    const newMode: GameMode = { type: 'artist', artistName }
    setGameMode(newMode)
    setGameState(INITIAL_GAME_STATE)
    setSelectedId(null)
    setQuestionPromise(fetchQuestion(newMode))
  }, [router])

  const handleSelect = useCallback(
    (option: TrackOption) => {
      if (selectedId !== null) return
      setSelectedId(option.id)
      setGameState(prev => {
        const newState = applyGuess(prev, option.isCorrect)
        if (newState.status === 'playing') {
          setTimeout(() => nextQuestion(gameMode), 1500)
        }
        return newState
      })
    },
    [selectedId, nextQuestion, gameMode]
  )

  if (gameState.status === 'won') {
    return (
      <Prize
        score={gameState.score}
        gameName={getGameName(gameMode)}
        onRestart={restartGame}
        onArtistSelect={switchToArtist}
      />
    )
  }
  if (gameState.status === 'lost') {
    return (
      <GameOver
        score={gameState.score}
        gameName={getGameName(gameMode)}
        onRestart={restartGame}
        onArtistSelect={switchToArtist}
      />
    )
  }

  return (
    <div className="game-board">
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
              setQuestionPromise(fetchQuestion(gameMode))
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
