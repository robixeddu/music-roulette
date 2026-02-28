'use client'

import { GENRES } from '@/lib/genres'
import { GenreGrid } from '@/components/GenreGrid'
import { AppNav } from '@/components/AppNav'
import { useLocale } from '@/hooks/useLocale'
import styles from './genres.module.css'

export default function GenresPage() {
  const { t } = useLocale()

  return (
    <div className={styles.page}>
      <AppNav backHref="/" backLabel={t('nav.back.home')} title="Music Roulette" />
      <div className={styles.content}>
        <header className={styles.header}>
          <h1 className={styles.title}>{t('genres.title')}</h1>
          <p className={styles.subtitle}>{t('genres.subtitle')}</p>
        </header>
        <GenreGrid genres={GENRES} />
      </div>
    </div>
  )
}