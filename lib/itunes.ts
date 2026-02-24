/**
 * Wrapper iTunes Search API — server only.
 *
 * Modalità genere:  fetchTracksByGenre(searchTerms[])
 * Modalità artista: fetchTracksByArtist(artistName)
 *
 * buildQuestion      → label "Artista — Titolo" (genere)
 * buildArtistQuestion → label solo "Titolo" (artista già noto)
 */
import type { iTunesTrack, iTunesSearchResponse, ArtistResult, TrackOption, TrackQuestion } from './types'
import { shuffleArray } from './utils'

const ITUNES_BASE = 'https://itunes.apple.com'

// ─── Fetch helpers ────────────────────────────────────────────────────────────

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

// ─── Modalità genere ──────────────────────────────────────────────────────────

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

// ─── Modalità artista ─────────────────────────────────────────────────────────

/**
 * Cerca artisti su iTunes per autocompletamento.
 */
export async function searchArtists(query: string, limit = 6): Promise<ArtistResult[]> {
  if (!query.trim()) return []
  const params = new URLSearchParams({
    term: query,
    media: 'music',
    entity: 'musicArtist',
    attribute: 'artistTerm',
    limit: String(limit),
    country: 'US',
  })
  try {
    const res = await fetch(`${ITUNES_BASE}/search?${params}`, {
      next: { revalidate: 300 },
    })
    if (!res.ok) return []
    const json = await res.json()
    return (json.results ?? []).map((r: { artistId: number; artistName: string; primaryGenreName?: string }) => ({
      artistId: r.artistId,
      artistName: r.artistName,
      primaryGenreName: r.primaryGenreName ?? '',
    }))
  } catch {
    return []
  }
}

/**
 * Fetcha fino a 50 brani di un artista specifico.
 * Filtra per corrispondenza artista per evitare brani estranei.
 */
export async function fetchTracksByArtist(artistName: string): Promise<iTunesTrack[]> {
  const params = new URLSearchParams({
    term: artistName,
    media: 'music',
    entity: 'song',
    attribute: 'artistTerm',
    limit: '50',
    country: 'US',
  })
  try {
    const res = await fetch(`${ITUNES_BASE}/search?${params}`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []
    const json: iTunesSearchResponse = await res.json()
    const artistLower = artistName.toLowerCase().replace(/[^a-z0-9]/g, '')
    return json.results.filter(t => {
      if (!t.previewUrl || !t.trackId) return false
      const resultArtist = t.artistName.toLowerCase().replace(/[^a-z0-9]/g, '')
      return resultArtist.includes(artistLower) || artistLower.includes(resultArtist)
    })
  } catch {
    return []
  }
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

/** Modalità genere: label "Artista — Titolo" */
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

/**
 * Modalità artista: label solo "Titolo".
 * L'artista è già noto → mostrarlo sarebbe banale.
 * Tutte le fake sono brani dello stesso artista → quiz più difficile.
 */
export function buildArtistQuestion(correct: iTunesTrack, fakes: iTunesTrack[]): TrackQuestion {
  const albumCover = correct.artworkUrl100
    .replace('100x100bb', '300x300bb')
    .replace('100x100', '300x300')

  const options: TrackOption[] = shuffleArray([
    { id: correct.trackId, label: correct.trackName, isCorrect: true },
    ...fakes.map(f => ({ id: f.trackId, label: f.trackName, isCorrect: false })),
  ])

  return { previewUrl: correct.previewUrl, albumCover, options }
}
