import { applyGuess, getPrize, isGameOver, formatScore } from '@/lib/game-utils'
import type { GameState } from '@/lib/types'
import { INITIAL_GAME_STATE, WIN_SCORE, MAX_LIVES } from '@/lib/types'

// ─── applyGuess ──────────────────────────────────────────────────────────────

describe('applyGuess', () => {
  it('incrementa lo score quando la risposta è corretta', () => {
    const next = applyGuess(INITIAL_GAME_STATE, true)
    expect(next.score).toBe(1)
    expect(next.lives).toBe(MAX_LIVES)
    expect(next.status).toBe('playing')
  })

  it('decrementa le vite quando la risposta è sbagliata', () => {
    const next = applyGuess(INITIAL_GAME_STATE, false)
    expect(next.lives).toBe(MAX_LIVES - 1)
    expect(next.score).toBe(0)
    expect(next.status).toBe('playing')
  })

  it('imposta status "won" quando si raggiunge WIN_SCORE', () => {
    const almostWon: GameState = { ...INITIAL_GAME_STATE, score: WIN_SCORE - 1 }
    const next = applyGuess(almostWon, true)
    expect(next.status).toBe('won')
    expect(next.score).toBe(WIN_SCORE)
  })

  it('imposta status "lost" quando le vite finiscono', () => {
    const lastLife: GameState = { ...INITIAL_GAME_STATE, lives: 1 }
    const next = applyGuess(lastLife, false)
    expect(next.status).toBe('lost')
    expect(next.lives).toBe(0)
  })

  it('non modifica lo stato se il gioco è già finito', () => {
    const won: GameState = { lives: 3, score: WIN_SCORE, status: 'won' }
    expect(applyGuess(won, true)).toEqual(won)
    expect(applyGuess(won, false)).toEqual(won)
  })

  it('le vite non scendono sotto 0', () => {
    const noLives: GameState = { ...INITIAL_GAME_STATE, lives: 1 }
    const next = applyGuess(noLives, false)
    expect(next.lives).toBe(0)
    expect(next.status).toBe('lost')
  })
})

// ─── getPrize ────────────────────────────────────────────────────────────────

describe('getPrize', () => {
  it('ritorna il trofeo quando score >= WIN_SCORE', () => {
    const prize = getPrize(WIN_SCORE)
    expect(prize.emoji).toBe('🏆')
    expect(prize.message).toBeTruthy()
  })

  it('ritorna il premio default quando score < WIN_SCORE', () => {
    const prize = getPrize(WIN_SCORE - 1)
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
  it('formatta il punteggio nel formato "n / WIN_SCORE"', () => {
    expect(formatScore(3)).toBe(`3 / ${WIN_SCORE}`)
    expect(formatScore(0)).toBe(`0 / ${WIN_SCORE}`)
  })
})
