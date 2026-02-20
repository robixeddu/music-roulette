import { NextRequest, NextResponse } from 'next/server'
import { fetchChartTracks, pickQuestionTracks } from '@/lib/deezer'
import { buildQuestion } from '@/lib/game-utils'

/**
 * GET /api/track?genreId=132
 *
 * Fetcha una domanda completa per il genere specificato.
 * genreId=0 o assente → chart globale.
 *
 * Tutto avviene server-side:
 * - Niente CORS issues verso Deezer
 * - Il client riceve solo i dati necessari
 * - La chart è cached 1h da Next.js (vedi fetchChartTracks)
 * - La risposta singola NON è cached: ogni richiesta = track diversa
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const genreId = Number(searchParams.get('genreId') ?? 0)

    const tracks = await fetchChartTracks(genreId)
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
