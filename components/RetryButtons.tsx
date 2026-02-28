'use client'

import { ArtistSearch } from './ArtistSearch'
import { useLocale } from '@/hooks/useLocale'
import styles from './RetryButtons.module.css'
import btnStyles from './Btn.module.css'
import Link from 'next/link'

interface RetryButtonsProps {
  gameName: string
  onRestart: () => void
  onArtistSelect: (artistName: string) => void
}

export function RetryButtons({ gameName, onRestart, onArtistSelect }: RetryButtonsProps) {
  const { t } = useLocale()

  return (
    <>
      <button
        type="button"
        className={`${btnStyles.btn} ${btnStyles.primary} ${btnStyles.large}`}
        onClick={onRestart}
      >
        {t('retry.playAgain', { name: gameName })}
      </button>
      <div className={styles.divider} aria-hidden="true">
        {t('retry.or')}
      </div>
      <ArtistSearch onSelect={onArtistSelect} />
      <Link href="/leaderboard" className={styles.leaderboardLink}>
        {t('home.leaderboard')}
      </Link>
    </>
  )
}