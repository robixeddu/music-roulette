"use client";

import { useRouter } from "next/navigation";
import type { Genre } from "@/lib/types";
import { GENRE_THEMES, DEFAULT_THEME } from "@/lib/genres";
import styles from "./GenreGrid.module.css";

interface GenreGridProps {
  genres: Genre[];
}

export function GenreGrid({ genres }: GenreGridProps) {
  const router = useRouter();

  // Raggruppa per group mantenendo l'ordine di prima apparizione
  const groups: { name: string; items: Genre[] }[] = [];
  const seen = new Map<string, number>();
  for (const genre of genres) {
    if (!seen.has(genre.group)) {
      seen.set(genre.group, groups.length);
      groups.push({ name: genre.group, items: [] });
    }
    groups[seen.get(genre.group)!].items.push(genre);
  }

  let cardIndex = 0;

  return (
    <div className={styles.container}>
      {groups.map((group) => (
        <section key={group.name} className={styles.group}>
          <h2 className={styles.groupTitle}>{group.name}</h2>
          <ul className={styles.grid} role="list">
            {group.items.map((genre) => {
              const theme = GENRE_THEMES[genre.id] ?? DEFAULT_THEME;
              const delay = (cardIndex++ % 8) * 40;
              return (
                <li key={genre.id} role="listitem">
                  <button
                    type="button"
                    className={styles.card}
                    onClick={() => router.push(`/game?genreId=${genre.id}`)}
                    aria-label={`Gioca con ${genre.name}`}
                    style={
                      {
                        "--genre-accent": theme.accent,
                        "--genre-glow": theme.accentGlow,
                        "--genre-bg": theme.bgSurface,
                        "--card-delay": `${delay}ms`,
                      } as React.CSSProperties
                    }
                  >
                    <span className={styles.emojiWrap} aria-hidden="true">
                      <span className={styles.emoji}>{genre.emoji}</span>
                    </span>
                    <span className={styles.name}>{genre.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
