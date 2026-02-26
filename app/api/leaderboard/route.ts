import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import type { LeaderboardEntry, SubmitScorePayload } from '@/lib/types'

/**
 * GET /api/leaderboard
 * Ritorna i top 50 punteggi ordinati per score DESC.
 * Cache 30s: la classifica non deve essere stale troppo a lungo
 * ma non serve real-time.
 */
export async function GET() {
  try {
    const rows = await sql`
      SELECT id, nickname, score, level, level_name, genre, created_at
      FROM scores
      ORDER BY score DESC
      LIMIT 50
    ` as LeaderboardEntry[]

    return NextResponse.json(rows, {
      headers: { 'Cache-Control': 's-maxage=30, stale-while-revalidate=60' },
    })
  } catch (error) {
    console.error('[GET /api/leaderboard]', error)
    return NextResponse.json({ error: 'Errore nel caricamento della classifica.' }, { status: 500 })
  }
}

/**
 * POST /api/leaderboard
 * Salva un nuovo punteggio.
 * Body: { nickname, score, level, level_name, genre }
 */
export async function POST(request: NextRequest) {
  try {
    const body: SubmitScorePayload = await request.json()
    const { nickname, score, level, level_name, genre } = body

    // Validazione
    if (!nickname || typeof nickname !== 'string') {
      return NextResponse.json({ error: 'Nickname non valido.' }, { status: 400 })
    }
    const cleanNickname = nickname.trim().slice(0, 12).toUpperCase()
    if (cleanNickname.length < 1) {
      return NextResponse.json({ error: 'Nickname troppo corto.' }, { status: 400 })
    }
    if (typeof score !== 'number' || score < 0) {
      return NextResponse.json({ error: 'Score non valido.' }, { status: 400 })
    }

    const rows = await sql`
      INSERT INTO scores (nickname, score, level, level_name, genre)
      VALUES (${cleanNickname}, ${score}, ${level}, ${level_name}, ${genre})
      RETURNING id, nickname, score, level, level_name, genre, created_at
    ` as LeaderboardEntry[]

    return NextResponse.json(rows[0], { status: 201 })
  } catch (error) {
    console.error('[POST /api/leaderboard]', error)
    return NextResponse.json({ error: 'Errore nel salvataggio del punteggio.' }, { status: 500 })
  }
}
