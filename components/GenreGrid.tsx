'use client'

import { useRouter } from 'next/navigation'
import type { Genre } from '@/lib/types'
import { GENRE_THEMES, DEFAULT_THEME } from '@/lib/genres'

interface GenreGridProps {
  genres: Genre[]
}

export function GenreGrid({ genres }: GenreGridProps) {
  const router = useRouter()

  return (
    <ul className="genre-grid" role="list" aria-label="Seleziona un genere musicale">
      {genres.map(genre => {
        const theme = GENRE_THEMES[genre.id] ?? DEFAULT_THEME
        return (
          <li key={genre.id} role="listitem">
            <button
              type="button"
              className="genre-card"
              onClick={() => router.push(`/game?genreId=${genre.id}`)}
              aria-label={`Gioca con ${genre.name}`}
              style={{
                '--genre-accent': theme.accent,
                '--genre-glow': theme.accentGlow,
              } as React.CSSProperties}
            >
              <span className="genre-card__emoji" aria-hidden="true">
                {genre.emoji}
              </span>
              <span className="genre-card__name">{genre.name}</span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
