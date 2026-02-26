'use client'

import { useState, useEffect, useCallback } from 'react'
import { AppNav } from '@/components/AppNav'
import type { LeaderboardEntry } from '@/lib/types'

const POLL_INTERVAL = 12_000 // 12 secondi

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

function formatAvgTime(ms: number | null): string {
  if (ms === null) return '—'
  const s = ms / 1000
  if (s < 5)  return `${s.toFixed(1)}s ⚡`
  if (s < 10) return `${s.toFixed(1)}s 🔥`
  if (s < 20) return `${s.toFixed(1)}s`
  return `${s.toFixed(1)}s 🐢`
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchLeaderboard = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setIsRefreshing(true)
    try {
      const res = await fetch('/api/leaderboard', { cache: 'no-store' })
      if (res.ok) {
        const data: LeaderboardEntry[] = await res.json()
        setEntries(data)
        setLastUpdated(new Date())
      }
    } catch {
      // mantieni i dati precedenti in caso di errore
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  // Fetch iniziale
  useEffect(() => {
    fetchLeaderboard()
  }, [fetchLeaderboard])

  // Polling ogni 12s
  useEffect(() => {
    const id = setInterval(() => fetchLeaderboard(true), POLL_INTERVAL)
    return () => clearInterval(id)
  }, [fetchLeaderboard])

  return (
    <div className="leaderboard-page">
      <AppNav backHref="/" backLabel="Home" title="Music Roulette" />

      <div className="leaderboard-content">
        <header className="leaderboard-header">
          <h1 className="leaderboard-title">🏆 Hall of Fame</h1>
          <p className="leaderboard-subtitle">I migliori giocatori di Music Roulette</p>
          {lastUpdated && (
            <p className="leaderboard-updated" aria-live="polite">
              {isRefreshing ? '↻ aggiornamento…' : `aggiornato alle ${lastUpdated.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`}
            </p>
          )}
        </header>

        {loading ? (
          <div className="leaderboard-loading" aria-label="Caricamento classifica">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="leaderboard-entry leaderboard-entry--skeleton">
                <div className="skeleton skeleton--rank" />
                <div className="leaderboard-entry__info">
                  <div className="skeleton skeleton--nickname" />
                  <div className="skeleton skeleton--meta" />
                </div>
                <div className="leaderboard-entry__right">
                  <div className="skeleton skeleton--score" />
                  <div className="skeleton skeleton--time" />
                </div>
              </div>
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="leaderboard-empty">
            <p className="leaderboard-empty__text">
              Nessun punteggio ancora.<br />Sii il primo a entrare in classifica!
            </p>
            <a href="/" className="btn btn--primary">Gioca ora</a>
          </div>
        ) : (
          <>
            {/* Header colonne */}
            <div className="leaderboard-cols-header" aria-hidden="true">
              <span className="leaderboard-cols-header__rank">#</span>
              <span className="leaderboard-cols-header__player">Giocatore</span>
              <span className="leaderboard-cols-header__score">Punti</span>
              <span className="leaderboard-cols-header__time">Tempo avg</span>
            </div>

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
                      {levelEmoji(entry.level)} {entry.level_name} · {entry.genre} · {formatDate(entry.created_at)}
                    </span>
                  </div>

                  <span className="leaderboard-entry__score">{entry.score}</span>

                  <span className="leaderboard-entry__time">
                    {formatAvgTime(entry.avg_time_ms)}
                  </span>
                </li>
              ))}
            </ol>
          </>
        )}
      </div>
    </div>
  )
}
