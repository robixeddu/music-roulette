import { NextRequest, NextResponse } from 'next/server'
import {
  fetchTracksByGenre,
  fetchTracksByArtist,
  pickQuestionTracks,
  buildQuestion,
  buildArtistQuestion,
} from '@/lib/itunes'
import { getGenreById, GENRES } from '@/lib/genres'

// Limiti di input
const MAX_ARTIST_NAME_LEN = 100
const MAX_USED_IDS        = 200  // max id tracciabili per sessione
const MAX_USED_ARTISTS    = 100  // max artisti tracciabili per sessione
const MAX_GENRE_ID_LEN    = 50

/**
 * GET /api/track?genreId=rock
 * GET /api/track?artistName=Metallica&usedIds=123,456
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl

  // Sanifica artistName
  const rawArtistName = searchParams.get('artistName')
  const artistName = rawArtistName
    ? rawArtistName.trim().slice(0, MAX_ARTIST_NAME_LEN)
    : null

  // Sanifica genreId
  const rawGenreId = searchParams.get('genreId')
  const genreId = rawGenreId
    ? rawGenreId.trim().slice(0, MAX_GENRE_ID_LEN)
    : null

  // Sanifica e limita usedIds
  const usedIdsParam = searchParams.get('usedIds') ?? ''
  const usedIds = new Set<number>(
    usedIdsParam
      .split(',')
      .slice(0, MAX_USED_IDS)
      .map(s => parseInt(s.trim(), 10))
      .filter(n => Number.isInteger(n) && n > 0)
  )

  // Sanifica usedArtists
  const usedArtistsParam = searchParams.get('usedArtists') ?? ''
  const usedArtists = new Set<string>(
    usedArtistsParam
      .split('||')
      .slice(0, MAX_USED_ARTISTS)
      .map(s => s.trim())
      .filter(Boolean)
  )

  try {
    if (artistName) {
      const tracks = await fetchTracksByArtist(artistName)
      if (tracks.length < 4) {
        return NextResponse.json(
          { error: `Brani insufficienti per "${artistName}". Prova un altro artista.` },
          { status: 422 }
        )
      }
      const { correct, fakes } = pickQuestionTracks(tracks, 3, usedIds)
      const question = buildArtistQuestion(correct, fakes)
      return NextResponse.json(question, { headers: { 'Cache-Control': 'no-store' } })
    }

    // Modalità genere (default)
    const genre = getGenreById(genreId ?? '') ?? GENRES[0]
    const tracks = await fetchTracksByGenre(genre.searchTerms)
    const { correct, fakes } = pickQuestionTracks(tracks, 3, usedIds, usedArtists)
    const question = buildQuestion(correct, fakes)
    return NextResponse.json(question, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('[/api/track]', error)
    return NextResponse.json(
      { error: 'Impossibile caricare la traccia. Riprova.' },
      { status: 500 }
    )
  }
}