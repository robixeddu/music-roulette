'use client'

import { getPrize } from '@/lib/game-utils'
import { getNextLevel } from '@/lib/levels'
import type { Level } from '@/lib/levels'
import { RetryButtons } from './RetryButtons'
import styles from './Prize.module.css'
import btnStyles from './Btn.module.css'

interface PrizeProps {
  level: Level
  gameName: string
  onRestart: () => void
  onArtistSelect: (artistName: string) => void
  onAdvanceLevel: () => void
}

export function Prize({ level, gameName, onRestart, onArtistSelect, onAdvanceLevel }: PrizeProps) {
  const prize = getPrize(level.name)
  const nextLevel = getNextLevel(level)

  const handleAdvance = () => { onAdvanceLevel(); onRestart() }

  return (
    <div
      className={styles.prize}
      role="status"
      aria-live="assertive"
      aria-label={`Livello completato! ${prize.message}`}
    >
      <div className={styles.emoji} aria-hidden="true">{prize.emoji}</div>
      <h2 className={styles.title}>Livello completato!</h2>
      <p className={styles.message}>{prize.message}</p>

      {nextLevel && (
        <div className={styles.nextLevel}>
          <p className={styles.nextLevelLabel}>
            Prossimo livello: <strong>{nextLevel.name}</strong>
            <span className={styles.nextLevelDetail}>
              {nextLevel.winScore} risposte · moltiplicatore ×{nextLevel.multiplier}
            </span>
          </p>
          <button
            type="button"
            className={`${btnStyles.btn} ${btnStyles.primary} ${btnStyles.large}`}
            onClick={handleAdvance}
            autoFocus
          >
            Vai al livello {nextLevel.name} →
          </button>
        </div>
      )}

      <RetryButtons gameName={gameName} onRestart={onRestart} onArtistSelect={onArtistSelect} />
    </div>
  )
}
