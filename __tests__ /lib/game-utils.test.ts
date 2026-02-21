import { applyGuess, buildQuestion, getPrize, isGameOver, formatScore } from '@/lib/game-utils'
import type { GameState, DeezerTrack } from '@/lib/types'
import { INITIAL_GAME_STATE, WIN_SCORE, MAX_LIVES } from '@/lib/types'

// ─── Mock DeezerTrack helpers ────────────────────────────────────────────────

function makeTrack(id: number, title = `Track ${id}`, artist = `Artist ${id}`): DeezerTrack {
  return {
    id,
    title,
    preview: `https://example.com/preview/${id}.mp3`,
    artist: { id: id * 100, name: artist },
    album: { id: id * 1000, title: `Album ${id}`, cover_medium: `https://example.com/cover/${id}.jpg` },
  }
}

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

// ─── buildQuestion ───────────────────────────────────────────────────────────

describe('buildQuestion', () => {
  const correct = makeTrack(1, 'Correct Song', 'Correct Artist')
  const fakes = [makeTrack(2), makeTrack(3), makeTrack(4)]

  it('costruisce una domanda con previewUrl e albumCover', () => {
    const q = buildQuestion(correct, fakes)
    expect(q.previewUrl).toBe(correct.preview)
    expect(q.albumCover).toBe(correct.album.cover_medium)
  })

  it('include esattamente 1 opzione corretta', () => {
    const q = buildQuestion(correct, fakes)
    const correctOptions = q.options.filter((o) => o.isCorrect)
    expect(correctOptions).toHaveLength(1)
    expect(correctOptions[0].id).toBe(correct.id)
  })

  it('il totale di opzioni è fakes.length + 1', () => {
    const q = buildQuestion(correct, fakes)
    expect(q.options).toHaveLength(fakes.length + 1)
  })

  it("il label ha il formato 'Artista — Titolo'", () => {
    const q = buildQuestion(correct, fakes)
    const correctOption = q.options.find((o) => o.isCorrect)!
    expect(correctOption.label).toBe(`${correct.artist.name} — ${correct.title}`)
  })
})

// ─── getPrize ────────────────────────────────────────────────────────────────

describe('getPrize', () => {
  it('ritorna il premio quando score >= WIN_SCORE', () => {
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
