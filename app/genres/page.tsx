import type { Metadata } from 'next'
import { GENRES } from '@/lib/genres'
import { GenreGrid } from '@/components/GenreGrid'

export const metadata: Metadata = {
  title: 'Scegli il genere — Music Roulette',
}

/**
 * Pagina selezione genere — RSC puro.
 * I generi sono statici (nessuna fetch), quindi niente Suspense necessario.
 * Zero JS per questa pagina, rendering immediato.
 */
export default function GenresPage() {
  return (
    <div className="genres-page">
      <nav className="game-nav" aria-label="Navigazione principale">
        <a href="/" className="game-nav__back" aria-label="Torna alla homepage">
          ← Home
        </a>
        <span className="game-nav__title" aria-hidden="true">
          Music Roulette
        </span>
      </nav>

      <div className="genres-page__content">
        <header className="genres-page__header">
          <h1 className="genres-page__title">Scegli il genere</h1>
          <p className="genres-page__subtitle">
            Le domande saranno pescate dalla libreria iTunes del genere scelto
          </p>
        </header>

        <GenreGrid genres={GENRES} />
      </div>
    </div>
  )
}
