-- Music Roulette — Migration: aggiungi avg_time_ms
-- Esegui su Neon dashboard → SQL Editor su branch main E dev

ALTER TABLE scores ADD COLUMN IF NOT EXISTS avg_time_ms INTEGER;

-- Aggiorna la view per includere la nuova colonna
DROP VIEW IF EXISTS leaderboard_top50;
CREATE VIEW leaderboard_top50 AS
  SELECT id, nickname, score, level, level_name, genre, avg_time_ms, created_at
  FROM scores
  ORDER BY score DESC
  LIMIT 50;
