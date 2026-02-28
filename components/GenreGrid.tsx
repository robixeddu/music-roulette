'use client'

import { useRouter } from 'next/navigation'
import type { Genre } from '@/lib/types'
import { GENRE_THEMES, DEFAULT_THEME } from '@/lib/genres'
import styles from './GenreGrid.module.css'

interface GenreGridProps {
  genres: Genre[]
}

// ─── Pattern SVG per gruppo ───────────────────────────────────────────────────
// Ogni pattern è un SVG tileable codificato come stringa.
// Il colore viene iniettato al momento del render via template literal.
// Opacity bassa — il colore accent della banda rimane dominante.

function getPattern(group: string, accent: string): string {
  // Encode minimale per data URI: spazi → %20, # → %23, < → %3C, > → %3E, " → '
  const enc = (s: string) =>
    s.replace(/#/g, '%23').replace(/</g, '%3C').replace(/>/g, '%3E').replace(/"/g, "'")

  const c = accent   // colore accent esadecimale
  const op = '0.35'  // opacità pattern sopra la banda colorata

  const svgs: Record<string, string> = {
    // Pop — onde sinusoidali dolci
    Pop: `<svg xmlns='http://www.w3.org/2000/svg' width='40' height='12'>
      <path d='M0 6 Q10 0 20 6 Q30 12 40 6' fill='none' stroke='${c}' stroke-width='1.5' stroke-opacity='${op}'/>
    </svg>`,

    // Rock — linee diagonali bold
    Rock: `<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12'>
      <line x1='0' y1='12' x2='12' y2='0' stroke='${c}' stroke-width='2' stroke-opacity='${op}'/>
      <line x1='-6' y1='12' x2='6' y2='0' stroke='${c}' stroke-width='2' stroke-opacity='${op}'/>
      <line x1='6' y1='12' x2='18' y2='0' stroke='${c}' stroke-width='2' stroke-opacity='${op}'/>
    </svg>`,

    // Metal — chevron (>>>) seghettato
    Metal: `<svg xmlns='http://www.w3.org/2000/svg' width='20' height='12'>
      <polyline points='0,10 6,2 12,10 18,2' fill='none' stroke='${c}' stroke-width='1.8' stroke-opacity='${op}' stroke-linejoin='miter'/>
    </svg>`,

    // Hip-Hop — punti sfasati
    'Hip-Hop': `<svg xmlns='http://www.w3.org/2000/svg' width='16' height='10'>
      <circle cx='4' cy='3' r='1.8' fill='${c}' fill-opacity='${op}'/>
      <circle cx='12' cy='7' r='1.8' fill='${c}' fill-opacity='${op}'/>
    </svg>`,

    // Electronic — griglia fine
    Electronic: `<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12'>
      <line x1='0' y1='0' x2='0' y2='12' stroke='${c}' stroke-width='0.8' stroke-opacity='${op}'/>
      <line x1='6' y1='0' x2='6' y2='12' stroke='${c}' stroke-width='0.8' stroke-opacity='${op}'/>
      <line x1='0' y1='6' x2='12' y2='6' stroke='${c}' stroke-width='0.8' stroke-opacity='${op}'/>
    </svg>`,

    // Jazz — trattini obliqui sfasati, irregolari
    Jazz: `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='12'>
      <line x1='2' y1='10' x2='8' y2='4' stroke='${c}' stroke-width='1.5' stroke-opacity='${op}' stroke-linecap='round'/>
      <line x1='14' y1='8' x2='22' y2='3' stroke='${c}' stroke-width='1.5' stroke-opacity='${op}' stroke-linecap='round'/>
    </svg>`,

    // Soul — cerchi concentrici / cerchi singoli sparsi
    Soul: `<svg xmlns='http://www.w3.org/2000/svg' width='20' height='12'>
      <circle cx='6' cy='6' r='3.5' fill='none' stroke='${c}' stroke-width='1.2' stroke-opacity='${op}'/>
      <circle cx='16' cy='4' r='2' fill='none' stroke='${c}' stroke-width='1.2' stroke-opacity='${op}'/>
    </svg>`,

    // Blues — linee orizzontali larghe, spaziate
    Blues: `<svg xmlns='http://www.w3.org/2000/svg' width='20' height='10'>
      <line x1='0' y1='3' x2='20' y2='3' stroke='${c}' stroke-width='1.5' stroke-opacity='${op}'/>
      <line x1='0' y1='8' x2='20' y2='8' stroke='${c}' stroke-width='0.8' stroke-opacity='${op}'/>
    </svg>`,

    // Folk — trattini obliqui radi, come legno
    Folk: `<svg xmlns='http://www.w3.org/2000/svg' width='18' height='12'>
      <line x1='2' y1='0' x2='2' y2='12' stroke='${c}' stroke-width='1' stroke-opacity='${op}'/>
      <line x1='9' y1='0' x2='9' y2='12' stroke='${c}' stroke-width='0.6' stroke-opacity='${op}'/>
      <line x1='16' y1='0' x2='16' y2='12' stroke='${c}' stroke-width='1' stroke-opacity='${op}'/>
    </svg>`,

    // Punk — zigzag spigoloso
    Punk: `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='12'>
      <polyline points='0,10 6,2 12,10 18,2 24,10' fill='none' stroke='${c}' stroke-width='2' stroke-opacity='${op}' stroke-linejoin='miter'/>
    </svg>`,

    // Reggae — linee orizzontali uniformi, ritmo regolare
    Reggae: `<svg xmlns='http://www.w3.org/2000/svg' width='20' height='12'>
      <line x1='0' y1='2' x2='20' y2='2' stroke='${c}' stroke-width='1.5' stroke-opacity='${op}'/>
      <line x1='0' y1='6' x2='20' y2='6' stroke='${c}' stroke-width='1.5' stroke-opacity='${op}'/>
      <line x1='0' y1='10' x2='20' y2='10' stroke='${c}' stroke-width='1.5' stroke-opacity='${op}'/>
    </svg>`,

    // Classical — linee verticali sottili, come spartito
    Classical: `<svg xmlns='http://www.w3.org/2000/svg' width='16' height='12'>
      <line x1='2' y1='0' x2='2' y2='12' stroke='${c}' stroke-width='0.7' stroke-opacity='${op}'/>
      <line x1='6' y1='0' x2='6' y2='12' stroke='${c}' stroke-width='0.7' stroke-opacity='${op}'/>
      <line x1='10' y1='0' x2='10' y2='12' stroke='${c}' stroke-width='0.7' stroke-opacity='${op}'/>
      <line x1='14' y1='0' x2='14' y2='12' stroke='${c}' stroke-width='0.7' stroke-opacity='${op}'/>
    </svg>`,
  }

  const svg = svgs[group] ?? svgs['Pop']
  return `url("data:image/svg+xml,${enc(svg)}")`
}

// ─────────────────────────────────────────────────────────────────────────────

export function GenreGrid({ genres }: GenreGridProps) {
  const router = useRouter()

  const groups: { name: string; items: Genre[] }[] = []
  const seen = new Map<string, number>()
  for (const genre of genres) {
    if (!seen.has(genre.group)) {
      seen.set(genre.group, groups.length)
      groups.push({ name: genre.group, items: [] })
    }
    groups[seen.get(genre.group)!].items.push(genre)
  }

  let cardIndex = 0

  return (
    <div className={styles.container}>
      {groups.map(group => (
        <section key={group.name} className={styles.group}>
          <h2 className={styles.groupTitle}>{group.name}</h2>
          <ul className={styles.grid} role="list">
            {group.items.map(genre => {
              const theme = GENRE_THEMES[genre.id] ?? DEFAULT_THEME
              const delay = (cardIndex++ % 8) * 40
              const pattern = getPattern(genre.group, theme.accent)
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
                      '--genre-pattern': pattern,
                      '--card-delay': `${delay}ms`,
                    } as React.CSSProperties}
                  >
                    <span className={styles.band} aria-hidden="true" />
                    <span className={styles.name}>{genre.name}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}