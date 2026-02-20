import type { DeezerChartResponse, DeezerTrack, DeezerGenre, DeezerGenreResponse } from './types'

// Questo modulo gira SOLO sul server (importato da Route Handlers o RSC).
// Non contiene 'use client', quindi Next.js lo tiene fuori dal bundle browser.

const DEEZER_BASE = 'https://api.deezer.com'

/**
 * Fetcha la lista completa dei generi Deezer.
 * Cache lunga: i generi cambiano raramente (24h).
 */
export async function fetchGenres(): Promise<DeezerGenre[]> {
  const res = await fetch(`${DEEZER_BASE}/genre`, {
    next: { revalidate: 86400 }, // 24 ore
  })

  if (!res.ok) {
    throw new Error(`Deezer genres fetch failed: ${res.status} ${res.statusText}`)
  }

  const json: DeezerGenreResponse = await res.json()

  // Filtra il genere "All" (id=0) — non è un genere reale
  return json.data.filter((g) => g.id !== 0)
}

/**
 * Fetcha le top 100 tracks dalla chart di un genere specifico.
 * genreId=0 significa chart globale.
 * Cache 1h: le chart cambiano, ma non ogni minuto.
 */
export async function fetchChartTracks(genreId: number = 0): Promise<DeezerTrack[]> {
  const res = await fetch(`${DEEZER_BASE}/chart/${genreId}/tracks?limit=100`, {
    next: { revalidate: 3600 },
  })

  if (!res.ok) {
    throw new Error(`Deezer chart fetch failed: ${res.status} ${res.statusText}`)
  }

  const json: DeezerChartResponse = await res.json()

  // Filtra tracce senza preview (alcune non hanno il 30s clip)
  return json.data.filter((t) => t.preview && t.preview.length > 0)
}

/**
 * Sceglie una track casuale dall'array e costruisce 3 opzioni false
 * pescando da tracce diverse. Restituisce la track corretta + le fake.
 */
export function pickQuestionTracks(
  tracks: DeezerTrack[],
  count: number = 3
): { correct: DeezerTrack; fakes: DeezerTrack[] } {
  if (tracks.length < count + 1) {
    throw new Error('Not enough tracks to build a question')
  }

  const correctIndex = Math.floor(Math.random() * tracks.length)
  const correct = tracks[correctIndex]

  // Rimuovi la corretta dal pool e pesca `count` fake
  const pool = tracks.filter((_, i) => i !== correctIndex)
  const fakes = shuffleArray(pool).slice(0, count)

  return { correct, fakes }
}

/** Fisher-Yates shuffle — funzione pura, facile da testare */
export function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}
