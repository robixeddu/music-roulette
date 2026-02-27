'use client'

import { useRouter } from 'next/navigation'
import type { Genre } from '@/lib/types'
import { GENRE_THEMES, DEFAULT_THEME } from '@/lib/genres'
import styles from './GenreGrid.module.css'

interface GenreGridProps {
  genres: Genre[]
}

export function GenreGrid({ genres }: GenreGridProps) {
  const router = useRouter()

  return (
    <ul className={styles.grid} role="list" aria-label="Seleziona un genere musicale">
      {genres.map(genre => {
        const theme = GENRE_THEMES[genre.id] ?? DEFAULT_THEME
        return (
          <li key={genre.id} role="listitem">
            <button
              type="button"
              className={styles.card}
              onClick={() => router.push(`/game?genreId=${genre.id}`)}
              aria-label={`Gioca con ${genre.name}`}
              style={{
                '--genre-accent': theme.accent,
                '--genre-glow': theme.accentGlow,
              } as React.CSSProperties}
            >
              <span className={styles.emoji} aria-hidden="true">{genre.emoji}</span>
              <span className={styles.name}>{genre.name}</span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
