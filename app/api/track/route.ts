import { NextRequest, NextResponse } from 'next/server'
import { fetchTracksByGenre, pickQuestionTracks, buildQuestion } from '@/lib/itunes'
import { getGenreById, GENRES } from '@/lib/genres'

/**
 * GET /api/track?genreId=rock
 * Costruisce una domanda casuale per il genere richiesto.
 * no-store: ogni domanda deve essere diversa.
 */
export async function GET(request: NextRequest) {
  try {
    const genreId = request.nextUrl.searchParams.get('genreId') ?? GENRES[0].id
    const genre = getGenreById(genreId) ?? GENRES[0]

    const tracks = await fetchTracksByGenre(genre.searchTerms)
    const { correct, fakes } = pickQuestionTracks(tracks, 3)
    const question = buildQuestion(correct, fakes)

    return NextResponse.json(question, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (error) {
    console.error('[/api/track]', error)
    return NextResponse.json(
      { error: 'Impossibile caricare la traccia. Riprova.' },
      { status: 500 }
    )
  }
}
