import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import type { LeaderboardEntry, SubmitScorePayload } from '@/lib/types'
import { LEVELS } from '@/lib/levels'

// ─── Whitelist valori validi ───────────────────────────────────────────────
const VALID_LEVEL_IDS    = new Set(LEVELS.map(l => l.id))
const VALID_LEVEL_NAMES  = new Set(LEVELS.map(l => l.name))
const MAX_SCORE_POSSIBLE = Math.max(...LEVELS.map(l => l.winScore * l.multiplier * 3))

// ─── Rate limiting in-memory ───────────────────────────────────────────────
const rateMap = new Map<string, { count: number; resetAt: number }>()
const RATE_WINDOW = 60_000
const RATE_MAX    = 5

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW })
    return false
  }
  if (entry.count >= RATE_MAX) return true
  entry.count++
  return false
}

function getIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  )
}

/**
 * GET /api/leaderboard — top 50 punteggi
 */
export async function GET() {
  try {
    const rows = await sql`
      SELECT id, nickname, score, level, level_name, genre, avg_time_ms, created_at
      FROM scores
      ORDER BY score DESC
      LIMIT 50
    ` as LeaderboardEntry[]

    return NextResponse.json(rows, {
      headers: { 'Cache-Control': 'no-store' }, // no cache — polling client-side
    })
  } catch (error) {
    console.error('[GET /api/leaderboard]', error)
    return NextResponse.json({ error: 'Errore nel caricamento della classifica.' }, { status: 500 })
  }
}

/**
 * POST /api/leaderboard — salva nuovo punteggio
 */
export async function POST(request: NextRequest) {

  if (isRateLimited(getIp(request))) {
    return NextResponse.json(
      { error: 'Troppi tentativi. Riprova tra un minuto.' },
      { status: 429 }
    )
  }

  const contentLength = parseInt(request.headers.get('content-length') ?? '0', 10)
  if (contentLength > 512) {
    return NextResponse.json({ error: 'Payload non valido.' }, { status: 413 })
  }

  let body: Partial<SubmitScorePayload>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Formato non valido.' }, { status: 400 })
  }

  const { nickname, score, level, level_name, genre, avg_time_ms } = body

  // Validazione nickname
  if (typeof nickname !== 'string' || nickname.trim().length < 1) {
    return NextResponse.json({ error: 'Nickname non valido.' }, { status: 400 })
  }
  const cleanNickname = nickname.trim().slice(0, 12).toUpperCase().replace(/[^A-Z0-9_\-]/g, '')
  if (cleanNickname.length < 1) {
    return NextResponse.json({ error: 'Nickname contiene caratteri non validi.' }, { status: 400 })
  }

  // Validazione score
  if (typeof score !== 'number' || !Number.isInteger(score) || score < 0 || score > MAX_SCORE_POSSIBLE) {
    return NextResponse.json({ error: 'Score non valido.' }, { status: 400 })
  }

  // Validazione level
  if (typeof level !== 'number' || !VALID_LEVEL_IDS.has(level)) {
    return NextResponse.json({ error: 'Livello non valido.' }, { status: 400 })
  }

  // Validazione level_name + coerenza
  if (typeof level_name !== 'string' || !VALID_LEVEL_NAMES.has(level_name)) {
    return NextResponse.json({ error: 'Nome livello non valido.' }, { status: 400 })
  }
  const levelDef = LEVELS.find(l => l.id === level)
  if (!levelDef || levelDef.name !== level_name) {
    return NextResponse.json({ error: 'Combinazione level/level_name non valida.' }, { status: 400 })
  }

  // Validazione genre
  if (typeof genre !== 'string' || genre.trim().length < 1 || genre.length > 60) {
    return NextResponse.json({ error: 'Genre non valido.' }, { status: 400 })
  }
  const cleanGenre = genre.trim().slice(0, 60)

  // Validazione avg_time_ms (opzionale — null se l'utente non ha mai fatto play)
  let cleanAvgTimeMs: number | null = null
  if (avg_time_ms !== null && avg_time_ms !== undefined) {
    if (typeof avg_time_ms !== 'number' || !Number.isInteger(avg_time_ms) || avg_time_ms < 0 || avg_time_ms > 120_000) {
      return NextResponse.json({ error: 'avg_time_ms non valido.' }, { status: 400 })
    }
    cleanAvgTimeMs = avg_time_ms
  }

  try {
    const rows = await sql`
      INSERT INTO scores (nickname, score, level, level_name, genre, avg_time_ms)
      VALUES (${cleanNickname}, ${score}, ${level}, ${level_name}, ${cleanGenre}, ${cleanAvgTimeMs})
      RETURNING id, nickname, score, level, level_name, genre, avg_time_ms, created_at
    ` as LeaderboardEntry[]

    return NextResponse.json(rows[0], { status: 201 })
  } catch (error) {
    console.error('[POST /api/leaderboard]', error)
    return NextResponse.json({ error: 'Errore nel salvataggio del punteggio.' }, { status: 500 })
  }
}
