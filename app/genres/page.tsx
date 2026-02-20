import { Suspense } from 'react'
import type { Metadata } from 'next'
import { fetchGenres } from '@/lib/deezer'
import { GenreGrid } from '@/components/GenreGrid'
import { GenreGridSkeleton } from '@/components/GenreGridSkeleton'

export const metadata: Metadata = {
  title: 'Scegli il genere — Music Roulette',
}

/**
 * GenreList è un RSC async separato così possiamo wrapparlo in Suspense:
 * Next.js fa streaming — manda subito lo skeleton, poi sostituisce
 * con la griglia quando il fetch Deezer è completato.
 */
async function GenreList() {
  const genres = await fetchGenres()
  return <GenreGrid genres={genres} />
}

/**
 * Pagina selezione genere — RSC shell.
 * Il fetch dei generi avviene sul server (cached 24h).
 * Il browser non vede mai la chiamata a Deezer.
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
            Le domande saranno pescate dalla chart del genere scelto
          </p>
        </header>

        <Suspense fallback={<GenreGridSkeleton />}>
          <GenreList />
        </Suspense>
      </div>
    </div>
  )
}
