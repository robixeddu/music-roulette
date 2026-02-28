// ─── Generi ──────────────────────────────────────────────────────────────────

export interface Genre {
  id: string
  name: string
  emoji: string
  group: string        // categoria per raggruppamento visivo nella griglia
  searchTerms: string[]
}

export interface GenreTheme {
  accent: string
  accentGlow: string
  bg: string
  bgSurface: string
}

// ─── iTunes ──────────────────────────────────────────────────────────────────

export interface ArtistResult {
  artistId: number
  artistName: string
  primaryGenreName: string
}

export interface iTunesTrack {
  trackId: number
  trackName: string
  artistName: string
  collectionName: string
  previewUrl: string
  artworkUrl100: string
  primaryGenreName: string
}

export interface iTunesSearchResponse {
  resultCount: number
  results: iTunesTrack[]
}

// ─── Game domain ─────────────────────────────────────────────────────────────

export interface TrackOption {
  id: number
  label: string
  isCorrect: boolean
}

export interface TrackQuestion {
  previewUrl: string
  albumCover: string
  options: TrackOption[]
}

export type GuessResult = 'idle' | 'correct' | 'wrong'

export interface GameState {
  lives: number
  score: number
  status: 'playing' | 'won' | 'lost'
}

// ─── Leaderboard ─────────────────────────────────────────────────────────────

export interface LeaderboardEntry {
  id: number
  nickname: string
  score: number        // punteggio classifica = domande × moltiplicatore_livello × moltiplicatore_tempo
  level: number
  level_name: string
  genre: string
  avg_time_ms: number | null  // media ms per risposta corretta, null se nessun play
  created_at: string
}

export interface SubmitScorePayload {
  nickname: string
  score: number
  level: number
  level_name: string
  genre: string
  avg_time_ms: number | null
}

// ─── Costanti ─────────────────────────────────────────────────────────────────

export const MAX_LIVES = 3

export const INITIAL_GAME_STATE: GameState = {
  lives: MAX_LIVES,
  score: 0,
  status: 'playing',
}