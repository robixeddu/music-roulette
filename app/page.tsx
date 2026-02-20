/**
 * Homepage — Server Component puro. Zero JS client.
 */
export default function HomePage() {
  return (
    <div className="home">
      <div className="home__content">
        <h1 className="home__title">
          <span className="home__title-emoji" aria-hidden="true">🎵</span>
          Music Roulette
        </h1>
        <p className="home__tagline">
          Riconosci la canzone prima che le vite finiscano
        </p>
        <ul className="home__rules" aria-label="Regole del gioco">
          <li>Scegli il genere musicale</li>
          <li>Ascolta l&apos;estratto di 30 secondi</li>
          <li>Scegli artista e titolo tra 4 opzioni</li>
          <li>Hai 3 vite — ogni errore ne costa una</li>
          <li>Raggiungi 5 punti per vincere il premio 🏆</li>
        </ul>
        <a href="/genres" className="btn btn--primary btn--large">
          Scegli il genere
        </a>
      </div>
    </div>
  )
}
