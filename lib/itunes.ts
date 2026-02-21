import type { iTunesTrack, iTunesSearchResponse, TrackOption, TrackQuestion } from './types'

const ITUNES_BASE = 'https://itunes.apple.com'

/**
 * Cerca brani per nome artista su iTunes.
 * Ricerca per nome è più affidabile degli ID numerici
 * che variano tra regioni e cambiano nel tempo.
 */
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
    return json.results.filter(
      t => t.previewUrl && t.previewUrl.length > 0 && t.trackId
    )
  } catch {
    return []
  }
}

/**
 * Fetcha brani da un sottoinsieme casuale degli artisti del genere in parallelo.
 * Aggrega e mescola i risultati per variare le domande ad ogni partita.
 */
export async function fetchTracksByGenre(
  searchTerms: string[],
  sampleSize: number = 5
): Promise<iTunesTrack[]> {
  const sampled = shuffleArray(searchTerms).slice(0, sampleSize)

  const results = await Promise.allSettled(
    sampled.map(term => fetchByArtistName(term))
  )

  const tracks = results
    .filter((r): r is PromiseFulfilledResult<iTunesTrack[]> => r.status === 'fulfilled')
    .flatMap(r => r.value)

  // Deduplicazione per trackId (lo stesso brano può apparire più volte)
  const seen = new Set<number>()
  const unique = tracks.filter(t => {
    if (seen.has(t.trackId)) return false
    seen.add(t.trackId)
    return true
  })

  if (unique.length < 4) {
    throw new Error(`Not enough tracks for this genre (got ${unique.length})`)
  }

  return unique
}

/** Fisher-Yates shuffle */
export function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function pickQuestionTracks(
  tracks: iTunesTrack[],
  count: number = 3
): { correct: iTunesTrack; fakes: iTunesTrack[] } {
  if (tracks.length < count + 1) {
    throw new Error('Not enough tracks to build a question')
  }
  const correctIndex = Math.floor(Math.random() * tracks.length)
  const correct = tracks[correctIndex]
  const pool = tracks.filter((_, i) => i !== correctIndex)
  const fakes = shuffleArray(pool).slice(0, count)
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
