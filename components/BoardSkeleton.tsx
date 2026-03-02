'use client'

import styles from './BoardSkeleton.module.css'

/** Skeleton per app/game/page.tsx — sostituisce l'intero GameController
 *  Riproduce: .board (padding + gap) → header → cover → player → 4 choices
 */
export function BoardSkeleton() {
  return (
    <div className={styles.board} aria-hidden="true">
      {/* Header: Lives (3 hearts) + level badge + score */}
      <div className={styles.header}>
        <div className={`${styles.bone} ${styles.boneHearts}`} />
        <div className={`${styles.bone} ${styles.boneBadge}`} />
        <div className={`${styles.bone} ${styles.boneScore}`} />
      </div>
      {/* Question content */}
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