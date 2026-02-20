/**
 * Skeleton per la griglia generi — RSC, zero JS.
 * Mostra 12 placeholder card mentre la lista carica.
 */
export function GenreGridSkeleton() {
  return (
    <ul
      className="genre-grid"
      role="list"
      aria-busy="true"
      aria-label="Caricamento generi..."
    >
      {Array.from({ length: 12 }).map((_, i) => (
        <li key={i} role="listitem">
          <div className="genre-card genre-card--skeleton">
            <div className="skeleton genre-card__img-wrap" />
            <div className="skeleton genre-card__name-skeleton" />
          </div>
        </li>
      ))}
    </ul>
  )
}
