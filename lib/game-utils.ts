/**
 * Logica di gioco — funzioni pure, zero side effect.
 * Facilmente testabili in isolamento.
 */
import type { GameState } from './types'
import { WIN_SCORE } from './types'

/**
 * Calcola il nuovo GameState dopo una risposta dell'utente.
 * Non muta lo stato originale.
 */
export function applyGuess(state: GameState, isCorrect: boolean): GameState {
  if (state.status !== 'playing') return state

  if (isCorrect) {
    const newScore = state.score + 1
    return {
      ...state,
      score: newScore,
      status: newScore >= WIN_SCORE ? 'won' : 'playing',
    }
  } else {
    const newLives = state.lives - 1
    return {
      ...state,
      lives: newLives,
      status: newLives <= 0 ? 'lost' : 'playing',
    }
  }
}

/** Genera il messaggio di vittoria in base al punteggio. */
export function getPrize(score: number): { emoji: string; message: string } {
  if (score >= WIN_SCORE) {
    return { emoji: '🏆', message: 'Sei un vero intenditore musicale!' }
  }
  return { emoji: '🎵', message: 'Riprova, ci sei quasi!' }
}

/** Formatta il punteggio come "n / WIN_SCORE". */
export function formatScore(score: number): string {
  return `${score} / ${WIN_SCORE}`
}

/** Ritorna true se il gioco è terminato (vinto o perso). */
export function isGameOver(state: GameState): boolean {
  return state.status === 'won' || state.status === 'lost'
}
