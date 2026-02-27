import { pickQuestionTracks, buildQuestion } from '@/lib/itunes'
import type { iTunesTrack } from '@/lib/types'

function makeTrack(id: number, artist = `Artist ${id}`, title = `Track ${id}`): iTunesTrack {
  return {
    trackId: id,
    trackName: title,
    artistName: artist,
    collectionName: `Album ${id}`,
    previewUrl: `https://example.com/preview/${id}.mp3`,
    artworkUrl100: `https://example.com/artwork/100x100bb/${id}.jpg`,
    primaryGenreName: 'Pop',
  }
}

const pool = [makeTrack(1), makeTrack(2), makeTrack(3), makeTrack(4), makeTrack(5)]

// ─── pickQuestionTracks ───────────────────────────────────────────────────────

describe('pickQuestionTracks', () => {
  it('ritorna 1 corretta e 3 fake', () => {
    const { correct, fakes } = pickQuestionTracks(pool, 3)
    expect(fakes).toHaveLength(3)
    expect(pool).toContainEqual(correct)
    expect(fakes).not.toContainEqual(correct)
  })

  it('lancia se il pool è troppo piccolo', () => {
    expect(() => pickQuestionTracks([makeTrack(1), makeTrack(2)], 3)).toThrow()
  })
})

// ─── buildQuestion ────────────────────────────────────────────────────────────

describe('buildQuestion', () => {
  const correct = makeTrack(1, 'Correct Artist', 'Correct Song')
  const fakes = [makeTrack(2), makeTrack(3), makeTrack(4)]

  it('include previewUrl e albumCover', () => {
    const q = buildQuestion(correct, fakes)
    expect(q.previewUrl).toBe(correct.previewUrl)
    expect(q.albumCover).toContain('300x300')
  })

  it('ha esattamente 1 opzione corretta', () => {
    const q = buildQuestion(correct, fakes)
    expect(q.options.filter(o => o.isCorrect)).toHaveLength(1)
    expect(q.options.find(o => o.isCorrect)?.id).toBe(correct.trackId)
  })

  it('il totale delle opzioni è fakes.length + 1', () => {
    const q = buildQuestion(correct, fakes)
    expect(q.options).toHaveLength(fakes.length + 1)
  })

  it("il label ha il formato 'Artista — Titolo'", () => {
    const q = buildQuestion(correct, fakes)
    const correctOpt = q.options.find(o => o.isCorrect)!
    expect(correctOpt.label).toBe(`${correct.artistName} — ${correct.trackName}`)
  })
})