// ─── Generi ──────────────────────────────────────────────────────────────────

export interface Genre {
  id: string
  name: string
  emoji: string
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

// ─── Costanti ─────────────────────────────────────────────────────────────────

export const WIN_SCORE = 5
export const MAX_LIVES = 3

export const INITIAL_GAME_STATE: GameState = {
  lives: MAX_LIVES,
  score: 0,
  status: 'playing',
}
