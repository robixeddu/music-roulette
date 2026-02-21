import { shuffleArray, pickQuestionTracks } from '@/lib/deezer'
import type { DeezerTrack } from '@/lib/types'

function makeTrack(id: number): DeezerTrack {
  return {
    id,
    title: `Title ${id}`,
    preview: `https://cdn.deezer.com/preview/${id}.mp3`,
    artist: { id: id * 10, name: `Artist ${id}` },
    album: { id: id * 100, title: `Album ${id}`, cover_medium: `https://cdn.deezer.com/cover/${id}.jpg` },
  }
}

// ─── shuffleArray ────────────────────────────────────────────────────────────

describe('shuffleArray', () => {
  it('restituisce un array con gli stessi elementi', () => {
    const arr = [1, 2, 3, 4, 5]
    const shuffled = shuffleArray(arr)
    expect(shuffled).toHaveLength(arr.length)
    expect(shuffled.sort()).toEqual([...arr].sort())
  })

  it('non modifica l'array originale (immutabilità)', () => {
    const arr = [1, 2, 3, 4]
    const copy = [...arr]
    shuffleArray(arr)
    expect(arr).toEqual(copy)
  })

  it('funziona con array vuoto', () => {
    expect(shuffleArray([])).toEqual([])
  })

  it('funziona con un singolo elemento', () => {
    expect(shuffleArray([42])).toEqual([42])
  })
})

// ─── pickQuestionTracks ──────────────────────────────────────────────────────

describe('pickQuestionTracks', () => {
  const tracks = Array.from({ length: 20 }, (_, i) => makeTrack(i + 1))

  it('restituisce una track corretta e n fake', () => {
    const { correct, fakes } = pickQuestionTracks(tracks, 3)
    expect(fakes).toHaveLength(3)
    expect(correct).toBeDefined()
    expect(correct.preview).toBeTruthy()
  })

  it('la track corretta non è tra i fake', () => {
    const { correct, fakes } = pickQuestionTracks(tracks, 3)
    expect(fakes.find((f) => f.id === correct.id)).toBeUndefined()
  })

  it('i fake sono tutti diversi tra loro', () => {
    const { fakes } = pickQuestionTracks(tracks, 3)
    const ids = fakes.map((f) => f.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('lancia errore se non ci sono abbastanza tracce', () => {
    const few = [makeTrack(1), makeTrack(2)]
    expect(() => pickQuestionTracks(few, 3)).toThrow()
  })
})
