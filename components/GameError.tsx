interface GameErrorProps {
  onRetry: () => void
}

/**
 * Schermata di errore mostrata dall'ErrorBoundary quando
 * una Promise passata a use() viene rigettata.
 * RSC puro — zero JS.
 */
export function GameError({ onRetry }: GameErrorProps) {
  return (
    <div className="game-error" role="alert">
      <span className="game-error__icon" aria-hidden="true">⚠️</span>
      <p className="game-error__message">
        Impossibile caricare la canzone.
        <br />
        Controlla la connessione e riprova.
      </p>
      <button type="button" className="btn btn--primary" onClick={onRetry}>
        Riprova
      </button>
    </div>
  )
}
