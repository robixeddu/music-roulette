// ─── Generi ──────────────────────────────────────────────────────────────────

export interface Genre {
  id: string
  name: string
  emoji: string
  searchTerms: string[]   // termini di ricerca per artista su iTunes
}

export interface GenreTheme {
  accent: string
  accentGlow: string
  bg: string
  bgSurface: string
}

// ─── iTunes raw shapes ────────────────────────────────────────────────────────

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

// ─── Shapes usate dal gioco ──────────────────────────────────────────────────

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
