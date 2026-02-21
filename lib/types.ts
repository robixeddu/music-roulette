// ─── Generi ──────────────────────────────────────────────────────────────────

export interface Genre {
  id: string
  name: string
  emoji: string
  searchTerm: string  // termine usato per la ricerca iTunes
}

export interface GenreTheme {
  accent: string
  accentGlow: string
  bg: string
  bgSurface: string
}

// ─── iTunes raw shapes (solo ciò che usiamo) ─────────────────────────────────

export interface iTunesTrack {
  trackId: number
  trackName: string
  artistName: string
  collectionName: string
  previewUrl: string        // URL diretto, no token, CORS ok
  artworkUrl100: string     // cover 100x100
  primaryGenreName: string
}

export interface iTunesSearchResponse {
  resultCount: number
  results: iTunesTrack[]
}

// ─── Shapes usate dal gioco ──────────────────────────────────────────────────

export interface TrackOption {
  id: number
  label: string       // "Artist — Title"
  isCorrect: boolean
}

export interface TrackQuestion {
  previewUrl: string
  albumCover: string
  options: TrackOption[]
}

// ─── Game state ──────────────────────────────────────────────────────────────

export type GuessResult = 'idle' | 'correct' | 'wrong'

export interface GameState {
  lives: number
  score: number
  status: 'playing' | 'won' | 'lost'
}

export const INITIAL_GAME_STATE: GameState = {
  lives: 3,
  score: 0,
  status: 'playing',
}

export const WIN_SCORE = 5
export const MAX_LIVES = 3
