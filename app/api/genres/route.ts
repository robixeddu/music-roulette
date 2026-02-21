import { NextResponse } from 'next/server'
import { GENRES } from '@/lib/genres'

/**
 * GET /api/genres
 * Restituisce la lista statica dei generi supportati.
 * Non fetcha nessuna API esterna — risposta immediata.
 */
export async function GET() {
  return NextResponse.json(GENRES, {
    headers: {
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
