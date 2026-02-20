/**
 * Skeleton di caricamento mostrato come fallback di Suspense.
 * Nessun 'use client' — è un RSC puro, zero JS.
 * Usa aria-busy per comunicare lo stato di caricamento.
 */
export function GameSkeleton() {
  return (
    <div className="game-skeleton" aria-busy="true" aria-label="Caricamento prossima canzone...">
      {/* Album cover placeholder */}
      <div className="skeleton skeleton--cover" />

      {/* Player placeholder */}
      <div className="skeleton skeleton--player" />

      {/* Opzioni placeholder */}
      <div className="skeleton-choices">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton skeleton--choice" />
        ))}
      </div>
    </div>
  )
}
