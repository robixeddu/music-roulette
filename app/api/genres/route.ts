import { NextResponse } from 'next/server'
import { GENRES } from '@/lib/genres'

/**
 * GET /api/genres
 * Lista statica dei generi — risposta immediata, nessuna API esterna.
 * Cache aggressiva: i generi cambiano raramente.
 */
export async function GET() {
  return NextResponse.json(GENRES, {
    headers: {
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
