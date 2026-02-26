import { NextRequest, NextResponse } from 'next/server'
import { searchArtists } from '@/lib/itunes'

const MAX_QUERY_LEN = 100

/**
 * GET /api/artists?q=metallica
 * Autocomplete artisti — proxy verso iTunes Search API.
 */
export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get('q') ?? ''
  const q = raw.trim().slice(0, MAX_QUERY_LEN)

  if (q.length < 2) {
    return NextResponse.json([])
  }

  try {
    const artists = await searchArtists(q, 6)
    return NextResponse.json(artists, {
      headers: { 'Cache-Control': 'public, s-maxage=300' },
    })
  } catch {
    return NextResponse.json([])
  }
}
