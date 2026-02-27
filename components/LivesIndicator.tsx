'use client'

import { MAX_LIVES } from '@/lib/types'
import styles from './LivesIndicator.module.css'

interface LivesIndicatorProps {
  lives: number
}

export function LivesIndicator({ lives }: LivesIndicatorProps) {
  return (
    <div
      className={styles.indicator}
      role="status"
      aria-label={`Vite rimaste: ${lives} su ${MAX_LIVES}`}
      aria-live="polite"
    >
      {Array.from({ length: MAX_LIVES }).map((_, i) => (
        <span
          key={i}
          className={`${styles.heart} ${i < lives ? styles.heartActive : styles.heartLost}`}
          aria-hidden="true"
        >
          {i < lives ? '♥' : '♡'}
        </span>
      ))}
    </div>
  )
}
