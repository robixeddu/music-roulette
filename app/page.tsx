import { ArtistSearch } from "@/components/ArtistSearch";
import Link from "next/link";
import styles from "./home.module.css";
import btnStyles from "@/components/Btn.module.css";

export default function HomePage() {
  return (
    <div className={styles.home}>
      <div className={styles.content}>
        <h1 className={styles.title}>
          <span className={styles.titleEmoji} aria-hidden="true">
            🎵
          </span>
          Music Roulette
        </h1>
        <p className={styles.tagline}>
          Riconosci la canzone prima che le vite finiscano
        </p>
        <ul className={styles.rules} aria-label="Regole del gioco">
          <li>Scegli il genere o cerca un artista</li>
          <li>Ascolta l&apos;estratto di 30 secondi</li>
          <li>Scegli artista e titolo tra 4 opzioni</li>
          <li>Hai 3 vite — ogni errore ne costa una</li>
          <li>Vinci il livello e scala fino a Master 👑</li>
        </ul>

        <div className={styles.ctas}>
          <a
            href="/genres"
            className={`${btnStyles.btn} ${btnStyles.primary} ${btnStyles.large}`}
          >
            Scegli il genere
          </a>
          <div className={styles.divider} aria-hidden="true">
            oppure
          </div>
          <ArtistSearch />
          <Link href="/leaderboard" className={styles.leaderboardLink}>
            🏆 Hall of Fame
          </Link>
        </div>
      </div>
    </div>
  );
}
