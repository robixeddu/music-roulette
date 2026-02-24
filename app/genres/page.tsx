import type { Metadata } from 'next'
import { GENRES } from '@/lib/genres'
import { GenreGrid } from '@/components/GenreGrid'
import { AppNav } from '@/components/AppNav'

export const metadata: Metadata = {
  title: 'Scegli il genere — Music Roulette',
}

export default function GenresPage() {
  return (
    <div className="genres-page">
      <AppNav backHref="/" backLabel="Home" title="Music Roulette" />

      <div className="genres-page__content">
        <header className="genres-page__header">
          <h1 className="genres-page__title">Scegli il genere</h1>
          <p className="genres-page__subtitle">
            Ascolta l&apos;estratto e indovina artista e titolo
          </p>
        </header>

        <GenreGrid genres={GENRES} />
      </div>
    </div>
  )
}
