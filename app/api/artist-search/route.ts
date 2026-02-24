import { NextRequest, NextResponse } from 'next/server'
import { searchArtists } from '@/lib/itunes'

/**
 * GET /api/artist-search?q=radiohead
 * Cerca artisti su iTunes. Usato dal componente ArtistSearch per la ricerca live.
 */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') ?? ''

  if (q.trim().length < 2) {
    return NextResponse.json([])
  }

  try {
    const artists = await searchArtists(q)
    return NextResponse.json(artists, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' },
    })
  } catch (error) {
    console.error('[/api/artist-search]', error)
    return NextResponse.json([], { status: 500 })
  }
}
