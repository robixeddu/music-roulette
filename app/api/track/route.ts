import { NextRequest, NextResponse } from 'next/server'
import { fetchTracksByArtistIds, pickQuestionTracks, buildQuestion } from '@/lib/itunes'
import { getGenreById, GENRES } from '@/lib/genres'

/**
 * GET /api/track?genreId=pop
 *
 * Fetcha una domanda completa da iTunes Search API.
 * I previewUrl iTunes sono URL diretti, nessun problema CORS/ORB.
 */
export async function GET(request: NextRequest) {
  try {
    const genreId = request.nextUrl.searchParams.get('genreId') ?? 'pop'
    const genre = getGenreById(genreId) ?? GENRES[0]

    const tracks = await fetchTracksByArtistIds(genre.artistIds)
    const { correct, fakes } = pickQuestionTracks(tracks, 3)
    const question = buildQuestion(correct, fakes)

    return NextResponse.json(question, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (error) {
    console.error('[/api/track] Error:', error)
    return NextResponse.json(
      { error: 'Impossibile caricare la traccia. Riprova.' },
      { status: 500 }
    )
  }
}
