import { NextResponse } from 'next/server'
import { fetchGenres } from '@/lib/deezer'

/**
 * GET /api/genres
 *
 * Restituisce la lista generi Deezer con id, nome e immagine.
 * Cached 24h lato Next.js (i generi cambiano raramente).
 * Usato come fallback client-side se necessario — la pagina /genres
 * fetcha direttamente server-side tramite RSC.
 */
export async function GET() {
  try {
    const genres = await fetchGenres()

    return NextResponse.json(genres, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
      },
    })
  } catch (error) {
    console.error('[/api/genres] Error:', error)

    return NextResponse.json(
      { error: 'Impossibile caricare i generi. Riprova.' },
      { status: 500 }
    )
  }
}
