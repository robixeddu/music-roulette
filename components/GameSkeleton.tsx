'use client'

import { useLocale } from '@/hooks/useLocale'
import styles from './GameSkeleton.module.css'

export function GameSkeleton() {
  const { t } = useLocale()

  return (
    <div className={styles.skeleton} aria-busy="true" aria-label={t('aria.loading.track')}>
      <div className={`${styles.bone} ${styles.cover}`} />
      <div className={`${styles.bone} ${styles.player}`} />
      <div className={styles.choices}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`${styles.bone} ${styles.choice}`} />
        ))}
      </div>
    </div>
  )
}