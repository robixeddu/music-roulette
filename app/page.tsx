'use client'

import { ArtistSearch } from '@/components/ArtistSearch'
import Link from 'next/link'
import { useLocale } from '@/hooks/useLocale'
import styles from './home.module.css'
import btnStyles from '@/components/Btn.module.css'

export default function HomePage() {
  const { t } = useLocale()

  return (
    <div className={styles.home}>
      <div className={styles.content}>
        <h1 className={styles.title}>
          <span className={styles.titleEmoji} aria-hidden="true">🎵</span>
          Music Roulette
        </h1>
        <p className={styles.tagline}>{t('home.tagline')}</p>
        <ul className={styles.rules} aria-label={t('home.rules.label')}>
          <li>{t('home.rule1')}</li>
          <li>{t('home.rule2')}</li>
          <li>{t('home.rule3')}</li>
          <li>{t('home.rule4')}</li>
          <li>{t('home.rule5')}</li>
        </ul>

        <div className={styles.ctas}>
          <a href="/genres" className={`${btnStyles.btn} ${btnStyles.primary} ${btnStyles.large}`}>
            {t('home.btn.genre')}
          </a>
          <div className={styles.divider} aria-hidden="true">
            {t('home.or')}
          </div>
          <ArtistSearch />
          <Link href="/leaderboard" className={styles.leaderboardLink}>
            {t('home.leaderboard')}
          </Link>
        </div>
      </div>
    </div>
  )
}