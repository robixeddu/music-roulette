'use client'

import { useLocale } from '@/hooks/useLocale'
import styles from './GameError.module.css'
import btnStyles from './Btn.module.css'

interface GameErrorProps {
  onRetry: () => void
}

export function GameError({ onRetry }: GameErrorProps) {
  const { t } = useLocale()

  return (
    <div className={styles.error} role="alert">
      <span className={styles.icon} aria-hidden="true">⚠️</span>
      <p className={styles.message}>{t('game.error.msg')}</p>
      <button
        type="button"
        className={`${btnStyles.btn} ${btnStyles.primary}`}
        onClick={onRetry}
      >
        {t('game.error.retry')}
      </button>
    </div>
  )
}