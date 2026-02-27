import styles from './GameError.module.css'
import btnStyles from './Btn.module.css'

interface GameErrorProps {
  onRetry: () => void
}

export function GameError({ onRetry }: GameErrorProps) {
  return (
    <div className={styles.error} role="alert">
      <span className={styles.icon} aria-hidden="true">⚠️</span>
      <p className={styles.message}>
        Impossibile caricare la canzone.
        <br />
        Controlla la connessione e riprova.
      </p>
      <button
        type="button"
        className={`${btnStyles.btn} ${btnStyles.primary}`}
        onClick={onRetry}
      >
        Riprova
      </button>
    </div>
  )
}
