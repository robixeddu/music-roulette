import type { Metadata } from 'next'
import { AppNav } from '@/components/AppNav'
import type { LeaderboardEntry } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Classifica — Music Roulette',
}

// Revalidate ogni 30s — SSR con cache breve
export const revalidate = 30

async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/leaderboard`, {
      next: { revalidate: 30 },
    })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  })
}

function rankEmoji(rank: number): string {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return `#${rank}`
}

function levelEmoji(level: number): string {
  const map: Record<number, string> = { 1: '⭐', 2: '⭐⭐', 3: '⭐⭐⭐', 4: '👑' }
  return map[level] ?? '⭐'
}

export default async function LeaderboardPage() {
  const entries = await getLeaderboard()

  return (
    <div className="leaderboard-page">
      <AppNav backHref="/" backLabel="Home" title="Music Roulette" />

      <div className="leaderboard-content">
        <header className="leaderboard-header">
          <h1 className="leaderboard-title">🏆 Hall of Fame</h1>
          <p className="leaderboard-subtitle">I migliori giocatori di Music Roulette</p>
        </header>

        {entries.length === 0 ? (
          <div className="leaderboard-empty">
            <p className="leaderboard-empty__text">
              Nessun punteggio ancora.<br />Sii il primo a entrare in classifica!
            </p>
            <a href="/" className="btn btn--primary">Gioca ora</a>
          </div>
        ) : (
          <ol className="leaderboard-list" aria-label="Classifica globale">
            {entries.map((entry, i) => (
              <li
                key={entry.id}
                className={`leaderboard-entry ${i < 3 ? 'leaderboard-entry--podium' : ''}`}
              >
                <span className="leaderboard-entry__rank" aria-label={`Posizione ${i + 1}`}>
                  {rankEmoji(i + 1)}
                </span>

                <div className="leaderboard-entry__info">
                  <span className="leaderboard-entry__nickname">{entry.nickname}</span>
                  <span className="leaderboard-entry__meta">
                    {levelEmoji(entry.level)} {entry.level_name} · {entry.genre}
                  </span>
                </div>

                <div className="leaderboard-entry__right">
                  <span className="leaderboard-entry__score">{entry.score}</span>
                  <span className="leaderboard-entry__date">{formatDate(entry.created_at)}</span>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  )
}
