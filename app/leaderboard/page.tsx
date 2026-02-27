'use client'

import { useState, useEffect, useCallback } from 'react'
import { AppNav } from '@/components/AppNav'
import type { LeaderboardEntry } from '@/lib/types'
import styles from './leaderboard.module.css'
import btnStyles from '@/components/Btn.module.css'

const POLL_INTERVAL = 12_000

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: '2-digit' })
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
  const [entries, setEntries]         = useState<LeaderboardEntry[]>([])
  const [loading, setLoading]         = useState(true)
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

  useEffect(() => { fetchLeaderboard() }, [fetchLeaderboard])
  useEffect(() => {
    const id = setInterval(() => fetchLeaderboard(true), POLL_INTERVAL)
    return () => clearInterval(id)
  }, [fetchLeaderboard])

  return (
    <div className={styles.page}>
      <AppNav backHref="/" backLabel="Home" title="Music Roulette" />

      <div className={styles.content}>
        <header className={styles.header}>
          <h1 className={styles.title}>🏆 Hall of Fame</h1>
          <p className={styles.subtitle}>I migliori giocatori di Music Roulette</p>
          {lastUpdated && (
            <p className={styles.updated} aria-live="polite">
              {isRefreshing
                ? '↻ aggiornamento…'
                : `aggiornato alle ${lastUpdated.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
              }
            </p>
          )}
        </header>

        {loading ? (
          <div className={styles.loading} aria-label="Caricamento classifica">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`${styles.entry} ${styles.entrySkeleton}`}>
                <div className={`${styles.bone} ${styles.boneRank}`} />
                <div className={styles.info}>
                  <div className={`${styles.bone} ${styles.boneNickname}`} />
                  <div className={`${styles.bone} ${styles.boneMeta}`} />
                </div>
                <div className={`${styles.bone} ${styles.boneScore}`} />
                <div className={`${styles.bone} ${styles.boneTime}`} />
              </div>
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyText}>
              Nessun punteggio ancora.<br />Sii il primo a entrare in classifica!
            </p>
            <a href="/" className={`${btnStyles.btn} ${btnStyles.primary}`}>Gioca ora</a>
          </div>
        ) : (
          <>
            <div className={styles.colsHeader} aria-hidden="true">
              <span>#</span>
              <span>Giocatore</span>
              <span className={styles.colScore}>Punti</span>
              <span className={styles.colTime}>Tempo avg</span>
            </div>

            <ol className={styles.list} aria-label="Classifica globale">
              {entries.map((entry, i) => (
                <li
                  key={entry.id}
                  className={`${styles.entry} ${i < 3 ? styles.entryPodium : ''}`}
                >
                  <span className={styles.rank} aria-label={`Posizione ${i + 1}`}>
                    {rankEmoji(i + 1)}
                  </span>
                  <div className={styles.info}>
                    <span className={styles.nickname}>{entry.nickname}</span>
                    <span className={styles.meta}>
                      {levelEmoji(entry.level)} {entry.level_name} · {entry.genre} · {formatDate(entry.created_at)}
                    </span>
                  </div>
                  <span className={styles.score}>{entry.score}</span>
                  <span className={styles.time}>{formatAvgTime(entry.avg_time_ms)}</span>
                </li>
              ))}
            </ol>
          </>
        )}
      </div>
    </div>
  )
}
