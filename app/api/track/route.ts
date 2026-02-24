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
 *
 * `artistName` ha priorità su `genreId` se entrambi presenti.
 * no-store: ogni domanda deve essere diversa.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const artistName = searchParams.get('artistName')
  const genreId = searchParams.get('genreId')

  try {
    if (artistName) {
      const tracks = await fetchTracksByArtist(artistName)
      if (tracks.length < 4) {
        return NextResponse.json(
          { error: `Brani insufficienti per "${artistName}". Prova un altro artista.` },
          { status: 422 }
        )
      }
      const { correct, fakes } = pickQuestionTracks(tracks, 3)
      const question = buildArtistQuestion(correct, fakes)
      return NextResponse.json(question, { headers: { 'Cache-Control': 'no-store' } })
    }

    // Modalità genere (default)
    const genre = getGenreById(genreId ?? '') ?? GENRES[0]
    const tracks = await fetchTracksByGenre(genre.searchTerms)
    const { correct, fakes } = pickQuestionTracks(tracks, 3)
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
