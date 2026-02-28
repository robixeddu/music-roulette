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


// ─── Filtro qualità brani ─────────────────────────────────────────────────────

/**
 * Parole che indicano un brano non originale — tributi, karaoke,
 * cover versions, compilations.
 * Filtrarli previene opzioni incoerenti tipo "Enter Sandman [Karaoke Version]"
 * o "Master of Puppets (Originally Performed by Metallica)".
 */
const JUNK_PATTERNS = [
  /karaoke/i,
  /tribute/i,
  /originally performed/i,
  /originally by/i,
  /made famous/i,
  /in the style of/i,
  /cover version/i,
  /\(re.?recorded/i,
  /various artists/i,
  /backing track/i,
]

function isUsableTrack(t: iTunesTrack, searchedArtist: string): boolean {
  if (!t.previewUrl || !t.trackId) return false

  // Filtra brani junk da trackName o artistName
  const haystack = `${t.trackName} ${t.artistName}`
  if (JUNK_PATTERNS.some(p => p.test(haystack))) return false

  // Verifica che l'artista restituito sia effettivamente quello cercato
  // (previene contaminazione da artisti omonimi o collaborazioni marginali)
  const searched = searchedArtist.toLowerCase().replace(/[^a-z0-9]/g, '')
  const returned = t.artistName.toLowerCase().replace(/[^a-z0-9]/g, '')
  if (!returned.includes(searched) && !searched.includes(returned)) return false

  return true
}

const ITUNES_BASE = 'https://itunes.apple.com'

// ─── Fetch helpers ────────────────────────────────────────────────────────────

async function fetchByArtistName(artistName: string): Promise<iTunesTrack[]> {
  const params = new URLSearchParams({
    term: artistName,
    media: 'music',
    entity: 'song',
    attribute: 'artistTerm',
    limit: '25',          // era 10 — più brani per artista
    country: 'US',
  })
  try {
    const res = await fetch(`${ITUNES_BASE}/search?${params}`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []
    const json: iTunesSearchResponse = await res.json()
    return json.results.filter(t => isUsableTrack(t, artistName))
  } catch {
    return []
  }
}

// ─── Modalità genere ──────────────────────────────────────────────────────────

/**
 * Fetcha TUTTI gli artisti di searchTerms in parallelo (era campionato a 5).
 * Pool risultante: ~150-200 brani invece di ~50.
 */
export async function fetchTracksByGenre(
  searchTerms: string[],
): Promise<iTunesTrack[]> {
  const results = await Promise.allSettled(
    searchTerms.map(term => fetchByArtistName(term))
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

/**
 * Sceglie correct + fakes escludendo i trackId già usati in questa sessione.
 * usedIds viene passato dall'API route e popolato da GameController.
 */
export function pickQuestionTracks(
  tracks: iTunesTrack[],
  fakeCount = 3,
  usedIds: Set<number> = new Set()
): { correct: iTunesTrack; fakes: iTunesTrack[] } {
  // Filtra i brani già usati (correct + fake delle domande precedenti)
  const available = tracks.filter(t => !usedIds.has(t.trackId))

  // Fallback se il pool disponibile è esaurito
  const pool = available.length >= fakeCount + 1 ? available : tracks

  if (pool.length < fakeCount + 1) {
    throw new Error('Pool di brani troppo piccolo per costruire una domanda')
  }

  // Scegli la correct
  const correctIndex = Math.floor(Math.random() * pool.length)
  const correct = pool[correctIndex]
  const correctArtist = correct.artistName.toLowerCase()

  // Fake: artista diverso dalla correct, un brano per artista
  const usedFakeArtists = new Set<string>([correctArtist])
  const fakes: iTunesTrack[] = []

  for (const track of shuffleArray(pool.filter((_, i) => i !== correctIndex))) {
    if (fakes.length >= fakeCount) break
    const artist = track.artistName.toLowerCase()
    if (usedFakeArtists.has(artist)) continue
    usedFakeArtists.add(artist)
    fakes.push(track)
  }

  // Fallback: se non ci sono abbastanza artisti diversi, riempi senza vincolo artista
  if (fakes.length < fakeCount) {
    const used = new Set([correct.trackId, ...fakes.map(f => f.trackId)])
    for (const track of shuffleArray(pool)) {
      if (fakes.length >= fakeCount) break
      if (!used.has(track.trackId)) fakes.push(track)
    }
  }

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