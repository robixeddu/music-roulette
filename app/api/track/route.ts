import { NextRequest, NextResponse } from 'next/server'
import {
  fetchTracksByGenre,
  fetchTracksByArtist,
  pickQuestionTracks,
  buildQuestion,
  buildArtistQuestion,
} from '@/lib/itunes'
import { getGenreById, GENRES } from '@/lib/genres'

/**
 * GET /api/track?genreId=rock
 * GET /api/track?artistName=Metallica
 * GET /api/track?artistName=Metallica&usedIds=123,456,789
 *
 * usedIds: trackId separati da virgola già visti in questa sessione.
 * Vengono esclusi dal pool prima di pickQuestionTracks.
 *
 * artistName ha priorità su genreId se entrambi presenti.
 * no-store: ogni domanda deve essere diversa.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const artistName = searchParams.get('artistName')
  const genreId = searchParams.get('genreId')

  // Parsing usedIds dalla query string
  const usedIdsParam = searchParams.get('usedIds') ?? ''
  const usedIds = new Set<number>(
    usedIdsParam
      .split(',')
      .map(s => parseInt(s, 10))
      .filter(n => !isNaN(n))
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
    const { correct, fakes } = pickQuestionTracks(tracks, 3, usedIds)
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
