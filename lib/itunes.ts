import type { iTunesTrack, iTunesSearchResponse, TrackOption, TrackQuestion } from './types'

// Server-only: nessun 'use client', mai nel bundle browser.

const ITUNES_BASE = 'https://itunes.apple.com'

/**
 * Fetcha brani iTunes per un termine di ricerca legato al genere.
 * I previewUrl sono URL diretti su audio-ssl.itunes.apple.com —
 * nessun token HMAC, CORS aperto, funzionano direttamente nel browser.
 *
 * Cache 1h: i risultati per genere cambiano raramente.
 */
export async function fetchTracksByGenre(searchTerm: string): Promise<iTunesTrack[]> {
  const params = new URLSearchParams({
    term: searchTerm,
    media: 'music',
    entity: 'song',
    limit: '100',
    country: 'US',
  })

  const res = await fetch(`${ITUNES_BASE}/search?${params}`, {
    next: { revalidate: 3600 },
  })

  if (!res.ok) {
    throw new Error(`iTunes fetch failed: ${res.status} ${res.statusText}`)
  }

  const json: iTunesSearchResponse = await res.json()

  // Filtra tracce senza preview (alcune non ce l'hanno)
  return json.results.filter(
    (t) => t.previewUrl && t.previewUrl.length > 0
  )
}

/** Fisher-Yates shuffle — funzione pura */
export function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/** Sceglie una traccia casuale e costruisce le opzioni false */
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

/** Converte una iTunesTrack in TrackOption */
export function trackToOption(track: iTunesTrack, isCorrect: boolean): TrackOption {
  return {
    id: track.trackId,
    label: `${track.artistName} — ${track.trackName}`,
    isCorrect,
  }
}

/** Costruisce una TrackQuestion completa da mandare al client */
export function buildQuestion(
  correct: iTunesTrack,
  fakes: iTunesTrack[]
): TrackQuestion {
  // Cover: sostituisce 100x100 con 300x300 per qualità migliore
  const albumCover = correct.artworkUrl100.replace('100x100', '300x300')

  const options: TrackOption[] = shuffleArray([
    trackToOption(correct, true),
    ...fakes.map((f) => trackToOption(f, false)),
  ])

  return {
    previewUrl: correct.previewUrl,
    albumCover,
    options,
  }
}
