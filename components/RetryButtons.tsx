import { ArtistSearch } from "./ArtistSearch";
import styles from "./RetryButtons.module.css";
import btnStyles from "./Btn.module.css";
import Link from "next/dist/client/link";

interface RetryButtonsProps {
  gameName: string;
  onRestart: () => void;
  onArtistSelect: (artistName: string) => void;
}

export function RetryButtons({
  gameName,
  onRestart,
  onArtistSelect,
}: RetryButtonsProps) {
  return (
    <>
      <button
        type="button"
        className={`${btnStyles.btn} ${btnStyles.primary} ${btnStyles.large}`}
        onClick={onRestart}
      >
        Gioca ancora con {gameName}
      </button>
      <div className={styles.divider} aria-hidden="true">
        oppure
      </div>
      <ArtistSearch onSelect={onArtistSelect} />
      <Link href="/leaderboard" className={styles.leaderboardLink}>
        🏆 Hall of Fame
      </Link>
    </>
  );
}
