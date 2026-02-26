'use client'

import { useState, useCallback, useRef, Suspense } from 'react'
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

function fetchQuestion(mode: GameMode, usedIds: Set<number>): Promise<TrackQuestion> {
  const params = new URLSearchParams()

  if (mode.type === 'artist') {
    params.set('artistName', mode.artistName)
  } else {
    params.set('genreId', mode.genreId)
  }

  if (usedIds.size > 0) {
    params.set('usedIds', Array.from(usedIds).join(','))
  }

  return fetch(`/api/track?${params}`, { cache: 'no-store' }).then(res => {
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
  const [gameMode, setGameMode] = useState<GameMode>(initialMode)
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [questionPromise, setQuestionPromise] = useState(firstQuestionPromise)

  // Tutti i trackId già apparsi (correct + fakes) in questa sessione.
  const usedIdsRef = useRef<Set<number>>(new Set())

  // Ref alla questionPromise corrente: permette di leggere gli id
  // della domanda in corso dentro handleSelect senza closure stale.
  const questionPromiseRef = useRef<Promise<TrackQuestion>>(firstQuestionPromise)

  const nextQuestion = useCallback((mode: GameMode) => {
    setSelectedId(null)
    const p = fetchQuestion(mode, usedIdsRef.current)
    questionPromiseRef.current = p
    setQuestionPromise(p)
  }, [])

  const restartGame = useCallback(() => {
    usedIdsRef.current = new Set()
    setGameState(INITIAL_GAME_STATE)
    setSelectedId(null)
    const p = fetchQuestion(gameMode, usedIdsRef.current)
    questionPromiseRef.current = p
    setQuestionPromise(p)
  }, [gameMode])

  const switchToArtist = useCallback((artistName: string) => {
    router.replace(`/game?artistName=${encodeURIComponent(artistName)}`)
    const newMode: GameMode = { type: 'artist', artistName }
    usedIdsRef.current = new Set()
    setGameMode(newMode)
    setGameState(INITIAL_GAME_STATE)
    setSelectedId(null)
    const p = fetchQuestion(newMode, usedIdsRef.current)
    questionPromiseRef.current = p
    setQuestionPromise(p)
  }, [router])

  const handleSelect = useCallback(
    (option: TrackOption) => {
      if (selectedId !== null) return
      setSelectedId(option.id)

      setGameState(prev => {
        const newState = applyGuess(prev, option.isCorrect)
        if (newState.status === 'playing') {
          setTimeout(() => {
            // La questionPromise è già settled quando l'utente risponde.
            // Leggiamo gli id PRIMA di lanciare la fetch successiva,
            // così usedIdsRef è aggiornato nel momento corretto.
            questionPromiseRef.current.then(q => {
              q.options.forEach(o => usedIdsRef.current.add(o.id))
              nextQuestion(gameMode)
            })
          }, 1500)
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
              const p = fetchQuestion(gameMode, usedIdsRef.current)
              questionPromiseRef.current = p
              setQuestionPromise(p)
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
