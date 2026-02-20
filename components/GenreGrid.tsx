'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import type { DeezerGenre } from '@/lib/types'
import { GENRE_THEMES, DEFAULT_THEME } from '@/lib/genres'

interface GenreGridProps {
  genres: DeezerGenre[]
}

/**
 * Griglia di selezione genere.
 * Client Component perché usa useRouter per navigare con il genreId.
 *
 * Accessibilità:
 * - role="list" + role="listitem" per la griglia semantica
 * - Ogni card è un <button> navigabile da tastiera
 * - aria-label descrive la card con nome genere
 * - Il colore accent è visibile anche in modalità alto contrasto
 *   grazie al bordo colorato (non solo il background)
 */
export function GenreGrid({ genres }: GenreGridProps) {
  const router = useRouter()

  const handleSelect = (genre: DeezerGenre) => {
    router.push(`/game?genreId=${genre.id}&genreName=${encodeURIComponent(genre.name)}`)
  }

  return (
    <ul className="genre-grid" role="list" aria-label="Seleziona un genere musicale">
      {genres.map((genre) => {
        const theme = GENRE_THEMES[genre.id] ?? DEFAULT_THEME
        return (
          <li key={genre.id} role="listitem">
            <button
              type="button"
              className="genre-card"
              onClick={() => handleSelect(genre)}
              aria-label={`Gioca con ${genre.name}`}
              style={{
                '--genre-accent': theme.accent,
                '--genre-glow': theme.accentGlow,
              } as React.CSSProperties}
            >
              <div className="genre-card__img-wrap">
                <Image
                  src={genre.picture_medium}
                  alt=""
                  aria-hidden="true"
                  width={120}
                  height={120}
                  className="genre-card__img"
                />
                <div className="genre-card__overlay" aria-hidden="true" />
              </div>
              <span className="genre-card__name">{genre.name}</span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
