import Link from 'next/link'

interface AppNavProps {
  backHref: string
  backLabel: string
  title: string
}

/**
 * Barra di navigazione condivisa tra Genres e Game.
 * RSC puro — nessun 'use client'.
 */
export function AppNav({ backHref, backLabel, title }: AppNavProps) {
  return (
    <nav className="app-nav" aria-label="Navigazione principale">
      <Link
        href={backHref}
        className="app-nav__back"
        aria-label={`Torna a ${backLabel}`}
      >
        ← {backLabel}
      </Link>
      <span className="app-nav__title" aria-hidden="true">
        {title}
      </span>
    </nav>
  )
}
