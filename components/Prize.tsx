'use client'

import { useEffect, useRef } from 'react'
import { getPrize } from '@/lib/game-utils'
import { getNextLevel } from '@/lib/levels'
import type { Level } from '@/lib/levels'
import { RetryButtons } from './RetryButtons'
import { useLocale } from '@/hooks/useLocale'
import type { TranslationKey } from '@/lib/i18n'
import styles from './Prize.module.css'

interface PrizeProps {
  level: Level
  gameName: string
  onRestart: () => void
  onArtistSelect: (artistName: string) => void
  onAdvanceLevel: () => void
}

export function Prize({ level, gameName, onRestart, onArtistSelect, onAdvanceLevel }: PrizeProps) {
  const { t } = useLocale()
  const prize     = getPrize(level.name)
  const nextLevel = getNextLevel(level)
  const firedRef  = useRef(false)

  useEffect(() => {
    if (nextLevel && !firedRef.current) {
      firedRef.current = true
      onAdvanceLevel()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className={styles.prize}
      role="status"
      aria-live="assertive"
      aria-label={t('prize.label', { message: t(prize.messageKey as TranslationKey) })}
    >
      <div className={styles.emoji} aria-hidden="true">{prize.emoji}</div>
      <h2 className={styles.title}>{t('prize.title')}</h2>
      <p className={styles.message}>{t(prize.messageKey as TranslationKey)}</p>

      {nextLevel && (
        <div className={styles.nextLevel}>
          <p className={styles.nextLevelLabel}>
            {t('prize.nextLevel')} <strong>{nextLevel.name}</strong>
            <span className={styles.nextLevelDetail}>
              {t('prize.answers', { n: nextLevel.winScore })} · {t('prize.multiplier', { n: nextLevel.multiplier })}
            </span>
          </p>
        </div>
      )}

      <RetryButtons gameName={gameName} onRestart={onRestart} onArtistSelect={onArtistSelect} />
    </div>
  )
}