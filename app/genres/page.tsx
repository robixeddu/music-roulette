import type { Metadata } from 'next'
import { GENRES } from '@/lib/genres'
import { GenreGrid } from '@/components/GenreGrid'
import { AppNav } from '@/components/AppNav'
import styles from './genres.module.css'

export const metadata: Metadata = {
  title: 'Scegli il genere — Music Roulette',
}

export default function GenresPage() {
  return (
    <div className={styles.page}>
      <AppNav backHref="/" backLabel="Home" title="Music Roulette" />
      <div className={styles.content}>
        <header className={styles.header}>
          <h1 className={styles.title}>Scegli il genere</h1>
          <p className={styles.subtitle}>
            Ascolta l&apos;estratto e indovina artista e titolo
          </p>
        </header>
        <GenreGrid genres={GENRES} />
      </div>
    </div>
  )
}
