/**
 * Wrapper iTunes Search API — server only.
 *
 * Responsabilità:
 * - fetchByArtistName: singola chiamata iTunes per nome artista
 * - fetchTracksByGenre: campiona N artisti in parallelo e aggrega i brani
 * - pickQuestionTracks: sceglie 1 corretta + N fake dal pool
 * - buildQuestion: costruisce il TrackQuestion finale
 */
import type { iTunesTrack, iTunesSearchResponse, TrackOption, TrackQuestion } from './types'
import { shuffleArray } from './utils'

const ITUNES_BASE = 'https://itunes.apple.com'

// ─── Fetch ────────────────────────────────────────────────────────────────────

async function fetchByArtistName(artistName: string): Promise<iTunesTrack[]> {
  const params = new URLSearchParams({
    term: artistName,
    media: 'music',
    entity: 'song',
    attribute: 'artistTerm',
    limit: '10',
    country: 'US',
  })

  try {
    const res = await fetch(`${ITUNES_BASE}/search?${params}`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []
    const json: iTunesSearchResponse = await res.json()
    return json.results.filter(t => t.previewUrl && t.previewUrl.length > 0 && t.trackId)
  } catch {
    return []
  }
}

/**
 * Campiona `sampleSize` artisti casuali da searchTerms,
 * li fetcha in parallelo su iTunes e aggrega i brani deduplicati.
 */
export async function fetchTracksByGenre(
  searchTerms: string[],
  sampleSize = 5
): Promise<iTunesTrack[]> {
  const sampled = shuffleArray(searchTerms).slice(0, sampleSize)

  const results = await Promise.allSettled(
    sampled.map(term => fetchByArtistName(term))
  )

  const tracks = results
    .filter((r): r is PromiseFulfilledResult<iTunesTrack[]> => r.status === 'fulfilled')
    .flatMap(r => r.value)

  const seen = new Set<number>()
  const unique = tracks.filter(t => {
    if (seen.has(t.trackId)) return false
    seen.add(t.trackId)
    return true
  })

  if (unique.length < 4) {
    throw new Error(`Brani insufficienti per questo genere (trovati: ${unique.length})`)
  }

  return unique
}

// ─── Question building ────────────────────────────────────────────────────────

export function pickQuestionTracks(
  tracks: iTunesTrack[],
  fakeCount = 3
): { correct: iTunesTrack; fakes: iTunesTrack[] } {
  if (tracks.length < fakeCount + 1) {
    throw new Error('Pool di brani troppo piccolo per costruire una domanda')
  }
  const correctIndex = Math.floor(Math.random() * tracks.length)
  const correct = tracks[correctIndex]
  const fakes = shuffleArray(tracks.filter((_, i) => i !== correctIndex)).slice(0, fakeCount)
  return { correct, fakes }
}

export function buildQuestion(correct: iTunesTrack, fakes: iTunesTrack[]): TrackQuestion {
  const albumCover = correct.artworkUrl100
    .replace('100x100bb', '300x300bb')
    .replace('100x100', '300x300')

  const options: TrackOption[] = shuffleArray([
    { id: correct.trackId, label: `${correct.artistName} — ${correct.trackName}`, isCorrect: true },
    ...fakes.map(f => ({ id: f.trackId, label: `${f.artistName} — ${f.trackName}`, isCorrect: false })),
  ])

  return { previewUrl: correct.previewUrl, albumCover, options }
}
