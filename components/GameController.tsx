'use client'

import { useState, useCallback, useRef, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import type { TrackQuestion, TrackOption, GameState } from '@/lib/types'
import { applyGuess, formatScore, makeInitialState } from '@/lib/game-utils'
import { loadLevel, saveLevel, getNextLevel, calcLeaderboardScore, MAX_LEVEL } from '@/lib/levels'
import type { Level } from '@/lib/levels'
import { QuestionView } from './QuestionView'
import { LivesIndicator } from './LivesIndicator'
import { Prize } from './Prize'
import { GameOver } from './GameOver'
import { GameSkeleton } from './GameSkeleton'
import { GameError } from './GameError'
import { ErrorBoundary } from './ErrorBoundary'
import styles from './GameController.module.css'

export type GameMode =
  | { type: 'genre'; genreId: string }
  | { type: 'artist'; artistName: string }

function fetchQuestion(mode: GameMode, usedIds: Set<number>): Promise<TrackQuestion> {
  const params = new URLSearchParams()
  if (mode.type === 'artist') params.set('artistName', mode.artistName)
  else params.set('genreId', mode.genreId)
  if (usedIds.size > 0) params.set('usedIds', Array.from(usedIds).join(','))
  return fetch(`/api/track?${params}`, { cache: 'no-store' }).then(res => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
  })
}

function getGameName(mode: GameMode): string {
  return mode.type === 'artist' ? mode.artistName : mode.genreId
}

// ─── Suoni feedback via Web Audio API ────────────────────────────────────────

function playFeedbackSound(correct: boolean) {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new AudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)

    if (correct) {
      osc.frequency.setValueAtTime(520, ctx.currentTime)
      osc.frequency.setValueAtTime(780, ctx.currentTime + 0.1)
      gain.gain.setValueAtTime(0.18, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.35)
    } else {
      osc.frequency.setValueAtTime(300, ctx.currentTime)
      osc.frequency.setValueAtTime(180, ctx.currentTime + 0.15)
      gain.gain.setValueAtTime(0.18, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.3)
    }

    osc.onended = () => ctx.close()
  } catch {
    // Web Audio non disponibile — silenzioso
  }
}

// ─────────────────────────────────────────────────────────────────────────────

interface GameControllerProps {
  firstQuestionPromise: Promise<TrackQuestion>
  gameMode: GameMode
}

export function GameController({ firstQuestionPromise, gameMode: initialMode }: GameControllerProps) {
  const router = useRouter()
  const [gameMode, setGameMode]     = useState<GameMode>(initialMode)
  const [gameState, setGameState]   = useState<GameState>(makeInitialState())
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [questionPromise, setQuestionPromise] = useState(firstQuestionPromise)
  const [level, setLevel] = useState<Level>({ id: 1, name: 'Rookie', winScore: 5, multiplier: 1, feedbackDelayMs: 1500 })

  useEffect(() => { setLevel(loadLevel()) }, [])

  const usedIdsRef         = useRef<Set<number>>(new Set())
  const questionPromiseRef = useRef<Promise<TrackQuestion>>(firstQuestionPromise)
  const playStartRef       = useRef<number | null>(null)
  const timeSamplesRef     = useRef<number[]>([])
  // Prefetch: la prossima domanda viene fetchata subito al click, non dopo il delay
  const prefetchRef        = useRef<Promise<TrackQuestion> | null>(null)
  // Congela il livello al momento della vittoria — evita che onAdvanceLevel()
  // cambi level.id e triggeri GameOver al posto di Prize
  const wonLevelRef        = useRef<Level>(level)

  const handleFirstPlay = useCallback(() => { playStartRef.current = Date.now() }, [])

  const getAvgTimeMs = useCallback((): number | null => {
    const s = timeSamplesRef.current
    if (s.length === 0) return null
    return Math.round(s.reduce((a, b) => a + b, 0) / s.length)
  }, [])

  const resetTimer = useCallback(() => { playStartRef.current = null }, [])

  const nextQuestion = useCallback((mode: GameMode) => {
    setSelectedId(null)
    resetTimer()
    // Usa il prefetch se già disponibile, altrimenti fetcha ora
    const p = prefetchRef.current ?? fetchQuestion(mode, usedIdsRef.current)
    prefetchRef.current = null
    questionPromiseRef.current = p
    setQuestionPromise(p)
  }, [resetTimer])

  const restartGame = useCallback(() => {
    usedIdsRef.current = new Set()
    timeSamplesRef.current = []
    playStartRef.current = null
    prefetchRef.current = null
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
    prefetchRef.current = null
    setGameMode(newMode)
    setGameState(makeInitialState())
    setSelectedId(null)
    const p = fetchQuestion(newMode, usedIdsRef.current)
    questionPromiseRef.current = p
    setQuestionPromise(p)
  }, [router])

  const advanceLevel = useCallback(() => {
    const next = getNextLevel(level)
    if (next) { saveLevel(next); setLevel(next) }
  }, [level])

  const handleSelect = useCallback((option: TrackOption) => {
    if (selectedId !== null) return
    setSelectedId(option.id)

    if (option.isCorrect && playStartRef.current !== null)
      timeSamplesRef.current.push(Date.now() - playStartRef.current)

    playFeedbackSound(option.isCorrect)

    const newState = applyGuess(gameState, option.isCorrect, level.winScore)
    if (newState.status === 'won') wonLevelRef.current = level
    setGameState(newState)

    if (newState.status === 'playing') {
      // Prefetch immediato — in parallelo al delay visivo del feedback
      questionPromiseRef.current.then(q => {
        q.options.forEach(o => usedIdsRef.current.add(o.id))
        prefetchRef.current = fetchQuestion(gameMode, usedIdsRef.current)
      })

      setTimeout(() => nextQuestion(gameMode), level.feedbackDelayMs)
    }
  }, [selectedId, gameState, nextQuestion, gameMode, level])

  const avgTimeMs = getAvgTimeMs()
  const leaderboardScore = calcLeaderboardScore(gameState.score, level, avgTimeMs)

  if (gameState.status === 'won') {
    if (wonLevelRef.current.id >= MAX_LEVEL) {
      return (
        <GameOver
          score={gameState.score} leaderboardScore={leaderboardScore}
          avgTimeMs={avgTimeMs} level={level}
          gameName={getGameName(gameMode)} isVictory={true}
          onRestart={restartGame} onArtistSelect={switchToArtist}
        />
      )
    }
    return (
      <Prize
        level={level} gameName={getGameName(gameMode)}
        onRestart={restartGame} onArtistSelect={switchToArtist} onAdvanceLevel={advanceLevel}
      />
    )
  }

  if (gameState.status === 'lost') {
    return (
      <GameOver
        score={gameState.score} leaderboardScore={leaderboardScore}
        avgTimeMs={avgTimeMs} level={level}
        gameName={getGameName(gameMode)} isVictory={false}
        onRestart={restartGame} onArtistSelect={switchToArtist}
      />
    )
  }

  return (
    <div className={styles.board}>
      <header className={styles.header}>
        <LivesIndicator lives={gameState.lives} />
        <div className={styles.levelBadge} aria-label={`Livello: ${level.name}`}>
          <span aria-hidden="true">{level.name}</span>
        </div>
        <div
          className={styles.score}
          aria-label={`Punteggio: ${formatScore(gameState.score, level.winScore)}`}
        >
          <span aria-hidden="true">{formatScore(gameState.score, level.winScore)}</span>
        </div>
      </header>

      <ErrorBoundary
        fallback={({ reset }) => (
          <GameError onRetry={() => {
            reset()
            prefetchRef.current = null
            const p = fetchQuestion(gameMode, usedIdsRef.current)
            questionPromiseRef.current = p
            setQuestionPromise(p)
          }} />
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