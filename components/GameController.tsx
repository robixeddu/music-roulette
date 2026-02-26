'use client'

import { useState, useCallback, useRef, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import type { TrackQuestion, TrackOption, GameState } from '@/lib/types'
import { applyGuess, formatScore, makeInitialState } from '@/lib/game-utils'
import { loadLevel, saveLevel, getNextLevel, calcLeaderboardScore } from '@/lib/levels'
import type { Level } from '@/lib/levels'
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
  const [gameState, setGameState] = useState<GameState>(makeInitialState())
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [questionPromise, setQuestionPromise] = useState(firstQuestionPromise)

  // Livello corrente — caricato da localStorage lato client
  const [level, setLevel] = useState<Level>({ id: 1, name: 'Rookie', winScore: 5, multiplier: 1 })
  useEffect(() => { setLevel(loadLevel()) }, [])

  const usedIdsRef = useRef<Set<number>>(new Set())
  const questionPromiseRef = useRef<Promise<TrackQuestion>>(firstQuestionPromise)

  // ─── Timer per risposta ───────────────────────────────────────────────────
  // playStartRef: timestamp del primo play per la domanda corrente (null = non ancora)
  // timeSamplesRef: array dei ms impiegati per ogni risposta corretta
  const playStartRef    = useRef<number | null>(null)
  const timeSamplesRef  = useRef<number[]>([])

  /** Chiamato da QuestionView → AudioPlayer al primo play di ogni domanda */
  const handleFirstPlay = useCallback(() => {
    playStartRef.current = Date.now()
  }, [])

  /** Calcola la media ms delle risposte corrette. null se nessun campione. */
  const getAvgTimeMs = useCallback((): number | null => {
    const samples = timeSamplesRef.current
    if (samples.length === 0) return null
    return Math.round(samples.reduce((a, b) => a + b, 0) / samples.length)
  }, [])

  /** Reset timer per nuova domanda */
  const resetTimer = useCallback(() => {
    playStartRef.current = null
  }, [])

  // ─── Navigazione domande ──────────────────────────────────────────────────

  const nextQuestion = useCallback((mode: GameMode) => {
    setSelectedId(null)
    resetTimer()
    const p = fetchQuestion(mode, usedIdsRef.current)
    questionPromiseRef.current = p
    setQuestionPromise(p)
  }, [resetTimer])

  const restartGame = useCallback(() => {
    usedIdsRef.current = new Set()
    timeSamplesRef.current = []
    playStartRef.current = null
    setGameState(makeInitialState())
    setSelectedId(null)
    const p = fetchQuestion(gameMode, usedIdsRef.current)
    questionPromiseRef.current = p
    setQuestionPromise(p)
  }, [gameMode])

  const switchToArtist = useCallback((artistName: string) => {
    router.replace(`/game?artistName=${encodeURIComponent(artistName)}`)
    const newMode: GameMode = { type: 'artist', artistName }
    usedIdsRef.current = new Set()
    timeSamplesRef.current = []
    playStartRef.current = null
    setGameMode(newMode)
    setGameState(makeInitialState())
    setSelectedId(null)
    const p = fetchQuestion(newMode, usedIdsRef.current)
    questionPromiseRef.current = p
    setQuestionPromise(p)
  }, [router])

  const advanceLevel = useCallback(() => {
    const next = getNextLevel(level)
    if (next) {
      saveLevel(next)
      setLevel(next)
    }
  }, [level])

  // ─── Selezione risposta ───────────────────────────────────────────────────

  const handleSelect = useCallback(
    (option: TrackOption) => {
      if (selectedId !== null) return
      setSelectedId(option.id)

      // Campiona il tempo se la domanda è stata avviata
      if (option.isCorrect && playStartRef.current !== null) {
        const elapsed = Date.now() - playStartRef.current
        timeSamplesRef.current.push(elapsed)
      }

      setGameState(prev => {
        const newState = applyGuess(prev, option.isCorrect, level.winScore)
        if (newState.status === 'playing') {
          setTimeout(() => {
            questionPromiseRef.current.then(q => {
              q.options.forEach(o => usedIdsRef.current.add(o.id))
              nextQuestion(gameMode)
            })
          }, 1500)
        }
        return newState
      })
    },
    [selectedId, nextQuestion, gameMode, level.winScore]
  )

  // Punteggio classifica = domande × moltiplicatore_livello × moltiplicatore_tempo
  const avgTimeMs = getAvgTimeMs()
  const leaderboardScore = calcLeaderboardScore(gameState.score, level, avgTimeMs)

  if (gameState.status === 'won') {
    return (
      <Prize
        score={gameState.score}
        leaderboardScore={leaderboardScore}
        avgTimeMs={avgTimeMs}
        level={level}
        gameName={getGameName(gameMode)}
        onRestart={restartGame}
        onArtistSelect={switchToArtist}
        onAdvanceLevel={advanceLevel}
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
        <div className="game-board__level" aria-label={`Livello: ${level.name}`}>
          <span aria-hidden="true" className="game-board__level-name">{level.name}</span>
        </div>
        <div
          className="game-board__score"
          aria-label={`Punteggio: ${formatScore(gameState.score, level.winScore)}`}
        >
          <span aria-hidden="true">🎯 {formatScore(gameState.score, level.winScore)}</span>
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
            onFirstPlay={handleFirstPlay}
          />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
