import styles from './GameSkeleton.module.css'

export function GameSkeleton() {
  return (
    <div className={styles.skeleton} aria-busy="true" aria-label="Caricamento prossima canzone...">
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
