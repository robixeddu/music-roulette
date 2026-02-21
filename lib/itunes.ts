import type { iTunesTrack, iTunesSearchResponse, TrackOption, TrackQuestion } from './types'

const ITUNES_BASE = 'https://itunes.apple.com'

/**
 * Fetcha le top song di un artista tramite lookup per ID.
 * Più affidabile della ricerca testuale: risultati sempre coerenti,
 * zero falsi positivi, preview quasi sempre presenti.
 */
async function fetchArtistTracks(artistId: number): Promise<iTunesTrack[]> {
  const params = new URLSearchParams({
    id: String(artistId),
    entity: 'song',
    limit: '10',
  })

  const res = await fetch(`${ITUNES_BASE}/lookup?${params}`, {
    next: { revalidate: 3600 },
  })

  if (!res.ok) return []

  const json: iTunesSearchResponse = await res.json()

  return json.results.filter(
    // Il primo risultato è l'artista stesso, non una track
    (t): t is iTunesTrack =>
      'trackId' in t &&
      'previewUrl' in t &&
      typeof t.previewUrl === 'string' &&
      t.previewUrl.length > 0
  )
}

/**
 * Fetcha brani da un pool di artisti in parallelo e li mescola.
 * Sceglie un sottoinsieme casuale di artisti per variare i risultati
 * ad ogni partita pur mantenendo un pool ampio.
 */
export async function fetchTracksByArtistIds(
  artistIds: number[],
  sampleSize: number = 5
): Promise<iTunesTrack[]> {
  // Prende un sottoinsieme casuale di artisti per variare ad ogni partita
  const sampled = shuffleArray(artistIds).slice(0, sampleSize)

  const results = await Promise.allSettled(
    sampled.map(id => fetchArtistTracks(id))
  )

  const tracks = results
    .filter((r): r is PromiseFulfilledResult<iTunesTrack[]> => r.status === 'fulfilled')
    .flatMap(r => r.value)

  if (tracks.length < 4) {
    throw new Error(`Not enough tracks for this genre (got ${tracks.length})`)
  }

  return tracks
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

/** Sceglie una traccia corretta e `count` fake dallo stesso pool */
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

export function buildQuestion(
  correct: iTunesTrack,
  fakes: iTunesTrack[]
): TrackQuestion {
  const albumCover = correct.artworkUrl100
    .replace('100x100bb', '300x300bb')
    .replace('100x100', '300x300')

  const options: TrackOption[] = shuffleArray([
    { id: correct.trackId, label: `${correct.artistName} — ${correct.trackName}`, isCorrect: true },
    ...fakes.map(f => ({ id: f.trackId, label: `${f.artistName} — ${f.trackName}`, isCorrect: false })),
  ])

  return {
    previewUrl: correct.previewUrl,
    albumCover,
    options,
  }
}