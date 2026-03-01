/**
 * Logica di gioco — funzioni pure, zero side effect.
 */
import type { GameState } from './types'
import { MAX_LIVES } from './types'
import { calcAnswerScore } from './levels'
import type { Level } from './levels'

/**
 * Calcola il nuovo GameState dopo una risposta dell'utente.
 * Accumula sessionScore risposta per risposta con streak e time multiplier.
 */
export function applyGuess(
  state: GameState,
  isCorrect: boolean,
  winScore: number,
  level: Level,
  avgTimeMs: number | null
): GameState {
  if (state.status !== 'playing') return state

  if (isCorrect) {
    const newStreak = state.streak + 1
    const points = calcAnswerScore(level, avgTimeMs, newStreak)
    const newScore = state.score + 1
    return {
      ...state,
      score: newScore,
      streak: newStreak,
      sessionScore: state.sessionScore + points,
      status: newScore >= winScore ? 'won' : 'playing',
    }
  } else {
    const newLives = state.lives - 1
    return {
      ...state,
      lives: newLives,
      streak: 0,
      status: newLives <= 0 ? 'lost' : 'playing',
    }
  }
}

/** Genera il messaggio di vittoria in base al livello. */
export function getPrize(levelName: string): { emoji: string; messageKey: string } {
  switch (levelName) {
    case 'Master':  return { emoji: '👑', messageKey: 'prize.msg.master' }
    case 'Expert':  return { emoji: '🏆', messageKey: 'prize.msg.expert' }
    case 'Arcade':  return { emoji: '🥈', messageKey: 'prize.msg.arcade' }
    default:        return { emoji: '🎵', messageKey: 'prize.msg.default' }
  }
}

/** Formatta il punteggio come "n / winScore". */
export function formatScore(score: number, winScore: number): string {
  return `${score} / ${winScore}`
}

/** Ritorna true se il gioco è terminato (vinto o perso). */
export function isGameOver(state: GameState): boolean {
  return state.status === 'won' || state.status === 'lost'
}

/** Stato iniziale — sempre 3 vite, punteggio 0, streak 0. */
export function makeInitialState(sessionScore = 0): GameState {
  return { lives: MAX_LIVES, score: 0, streak: 0, sessionScore, status: 'playing' }
}