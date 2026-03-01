import { applyGuess, getPrize, isGameOver, formatScore, makeInitialState } from '@/lib/game-utils'
import type { GameState } from '@/lib/types'
import { MAX_LIVES } from '@/lib/types'
import { LEVELS } from '@/lib/levels'

const WIN_SCORE = 5
const ROOKIE = LEVELS[0] // { id:1, name:'Rookie', multiplier:1, ... }
const INITIAL_GAME_STATE = makeInitialState()

// ─── applyGuess ──────────────────────────────────────────────────────────────

describe('applyGuess', () => {
  it('incrementa lo score quando la risposta è corretta', () => {
    const next = applyGuess(INITIAL_GAME_STATE, true, WIN_SCORE, ROOKIE, null)
    expect(next.score).toBe(1)
    expect(next.lives).toBe(MAX_LIVES)
    expect(next.status).toBe('playing')
  })

  it('incrementa streak e sessionScore sulla risposta corretta', () => {
    const next = applyGuess(INITIAL_GAME_STATE, true, WIN_SCORE, ROOKIE, null)
    expect(next.streak).toBe(1)
    expect(next.sessionScore).toBeGreaterThan(0)
  })

  it('decrementa le vite quando la risposta è sbagliata', () => {
    const next = applyGuess(INITIAL_GAME_STATE, false, WIN_SCORE, ROOKIE, null)
    expect(next.lives).toBe(MAX_LIVES - 1)
    expect(next.score).toBe(0)
    expect(next.status).toBe('playing')
  })

  it('azzera la streak sulla risposta sbagliata', () => {
    const withStreak: GameState = { ...INITIAL_GAME_STATE, streak: 5 }
    const next = applyGuess(withStreak, false, WIN_SCORE, ROOKIE, null)
    expect(next.streak).toBe(0)
  })

  it('imposta status "won" quando si raggiunge WIN_SCORE', () => {
    const almostWon: GameState = { ...INITIAL_GAME_STATE, score: WIN_SCORE - 1 }
    const next = applyGuess(almostWon, true, WIN_SCORE, ROOKIE, null)
    expect(next.status).toBe('won')
    expect(next.score).toBe(WIN_SCORE)
  })

  it('imposta status "lost" quando le vite finiscono', () => {
    const lastLife: GameState = { ...INITIAL_GAME_STATE, lives: 1 }
    const next = applyGuess(lastLife, false, WIN_SCORE, ROOKIE, null)
    expect(next.status).toBe('lost')
    expect(next.lives).toBe(0)
  })

  it('non modifica lo stato se il gioco è già finito', () => {
    const won: GameState = { lives: 3, score: WIN_SCORE, streak: 0, sessionScore: 0, status: 'won' }
    expect(applyGuess(won, true, WIN_SCORE, ROOKIE, null)).toEqual(won)
    expect(applyGuess(won, false, WIN_SCORE, ROOKIE, null)).toEqual(won)
  })

  it('le vite non scendono sotto 0', () => {
    const noLives: GameState = { ...INITIAL_GAME_STATE, lives: 1 }
    const next = applyGuess(noLives, false, WIN_SCORE, ROOKIE, null)
    expect(next.lives).toBe(0)
    expect(next.status).toBe('lost')
  })
})

// ─── getPrize ────────────────────────────────────────────────────────────────

describe('getPrize', () => {
  it('ritorna il trofeo per Master', () => {
    const prize = getPrize('Master')
    expect(prize.emoji).toBe('👑')
    expect(prize.message).toBeTruthy()
  })

  it('ritorna il trofeo per Expert', () => {
    const prize = getPrize('Expert')
    expect(prize.emoji).toBe('🏆')
  })

  it('ritorna la medaglia per Arcade', () => {
    const prize = getPrize('Arcade')
    expect(prize.emoji).toBe('🥈')
  })

  it('ritorna il premio default per Rookie', () => {
    const prize = getPrize('Rookie')
    expect(prize.emoji).toBe('🎵')
  })
})

// ─── isGameOver ──────────────────────────────────────────────────────────────

describe('isGameOver', () => {
  it('ritorna false durante il gioco', () => {
    expect(isGameOver(INITIAL_GAME_STATE)).toBe(false)
  })
  it('ritorna true se status è "won"', () => {
    expect(isGameOver({ ...INITIAL_GAME_STATE, status: 'won' })).toBe(true)
  })
  it('ritorna true se status è "lost"', () => {
    expect(isGameOver({ ...INITIAL_GAME_STATE, status: 'lost' })).toBe(true)
  })
})

// ─── formatScore ─────────────────────────────────────────────────────────────

describe('formatScore', () => {
  it('formatta il punteggio nel formato "n / winScore"', () => {
    expect(formatScore(3, WIN_SCORE)).toBe('3 / 5')
    expect(formatScore(0, WIN_SCORE)).toBe('0 / 5')
    expect(formatScore(8, 12)).toBe('8 / 12')
  })
})