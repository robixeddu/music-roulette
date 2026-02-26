import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import type { LeaderboardEntry, SubmitScorePayload } from '@/lib/types'
import { LEVELS } from '@/lib/levels'

// ─── Whitelist valori validi — derivati da LEVELS, non hardcoded ──────────────
const VALID_LEVEL_IDS   = new Set(LEVELS.map(l => l.id))
const VALID_LEVEL_NAMES = new Set(LEVELS.map(l => l.name))
const MAX_SCORE_POSSIBLE = Math.max(...LEVELS.map(l => l.winScore * l.multiplier))

// ─── Rate limiting in-memory ──────────────────────────────────────────────────
// Si resetta a ogni cold start (serverless), sufficiente per limitare burst.
// Per rate limiting persistente tra istanze → Upstash Redis.
const rateMap = new Map<string, { count: number; resetAt: number }>()
const RATE_WINDOW = 60_000  // 1 minuto
const RATE_MAX    = 5       // max 5 submit per IP per minuto

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
 * POST /api/leaderboard — salva nuovo punteggio
 */
export async function POST(request: NextRequest) {

  // 1. Rate limiting
  if (isRateLimited(getIp(request))) {
    return NextResponse.json(
      { error: 'Troppi tentativi. Riprova tra un minuto.' },
      { status: 429 }
    )
  }

  // 2. Limit body size (previene payload bombing)
  const contentLength = parseInt(request.headers.get('content-length') ?? '0', 10)
  if (contentLength > 512) {
    return NextResponse.json({ error: 'Payload non valido.' }, { status: 413 })
  }

  // 3. Parse JSON
  let body: Partial<SubmitScorePayload>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Formato non valido.' }, { status: 400 })
  }

  const { nickname, score, level, level_name, genre } = body

  // 4. Validazione nickname
  if (typeof nickname !== 'string' || nickname.trim().length < 1) {
    return NextResponse.json({ error: 'Nickname non valido.' }, { status: 400 })
  }
  // Solo lettere, numeri, underscore e trattino
  const cleanNickname = nickname.trim().slice(0, 12).toUpperCase().replace(/[^A-Z0-9_\-]/g, '')
  if (cleanNickname.length < 1) {
    return NextResponse.json({ error: 'Nickname contiene caratteri non validi.' }, { status: 400 })
  }

  // 5. Validazione score
  if (typeof score !== 'number' || !Number.isInteger(score) || score < 0 || score > MAX_SCORE_POSSIBLE) {
    return NextResponse.json({ error: 'Score non valido.' }, { status: 400 })
  }

  // 6. Validazione level (deve essere un id esistente)
  if (typeof level !== 'number' || !VALID_LEVEL_IDS.has(level)) {
    return NextResponse.json({ error: 'Livello non valido.' }, { status: 400 })
  }

  // 7. Validazione level_name (deve corrispondere a un livello esistente)
  if (typeof level_name !== 'string' || !VALID_LEVEL_NAMES.has(level_name)) {
    return NextResponse.json({ error: 'Nome livello non valido.' }, { status: 400 })
  }

  // 8. Coerenza level / level_name
  const levelDef = LEVELS.find(l => l.id === level)
  if (!levelDef || levelDef.name !== level_name) {
    return NextResponse.json({ error: 'Combinazione level/level_name non valida.' }, { status: 400 })
  }

  // 9. Coerenza score / level (non può superare winScore × multiplier)
  if (score > levelDef.winScore * levelDef.multiplier) {
    return NextResponse.json({ error: 'Score non coerente con il livello.' }, { status: 400 })
  }

  // 10. Validazione genre
  if (typeof genre !== 'string' || genre.trim().length < 1 || genre.length > 60) {
    return NextResponse.json({ error: 'Genre non valido.' }, { status: 400 })
  }
  const cleanGenre = genre.trim().slice(0, 60)

  // 11. Insert
  try {
    const rows = await sql`
      INSERT INTO scores (nickname, score, level, level_name, genre)
      VALUES (${cleanNickname}, ${score}, ${level}, ${level_name}, ${cleanGenre})
      RETURNING id, nickname, score, level, level_name, genre, created_at
    ` as LeaderboardEntry[]

    return NextResponse.json(rows[0], { status: 201 })
  } catch (error) {
    console.error('[POST /api/leaderboard]', error)
    return NextResponse.json({ error: 'Errore nel salvataggio del punteggio.' }, { status: 500 })
  }
}
