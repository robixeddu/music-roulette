-- Music Roulette — Leaderboard schema
-- Esegui su Neon dashboard → SQL Editor (su entrambi i branch: main e dev)

CREATE TABLE IF NOT EXISTS scores (
  id          SERIAL PRIMARY KEY,
  nickname    VARCHAR(12)  NOT NULL,
  score       INTEGER      NOT NULL,
  level       INTEGER      NOT NULL,
  level_name  VARCHAR(20)  NOT NULL,
  genre       VARCHAR(60)  NOT NULL,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Index per la classifica (ORDER BY score DESC è la query principale)
CREATE INDEX IF NOT EXISTS idx_scores_score ON scores (score DESC);

-- Opzionale: vedi i top score rapidamente
CREATE VIEW leaderboard_top50 AS
  SELECT
    id,
    nickname,
    score,
    level,
    level_name,
    genre,
    created_at
  FROM scores
  ORDER BY score DESC
  LIMIT 50;
