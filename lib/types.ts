// ─── Generi ──────────────────────────────────────────────────────────────────

export interface DeezerGenre {
  id: number
  name: string
  picture_medium: string
}

export interface DeezerGenreResponse {
  data: DeezerGenre[]
}

export interface GenreTheme {
  accent: string       // colore principale (CSS hex)
  accentGlow: string   // versione semi-trasparente per glow/shadow
  bg: string           // colore background base
  bgSurface: string    // card/surface
}

// Il genere selezionato che viaggia tra pagine tramite searchParams
export interface SelectedGenre {
  id: number
  name: string
}

// ─── Deezer raw shapes (solo ciò che usiamo) ────────────────────────────────

export interface DeezerArtist {
  id: number
  name: string
}

export interface DeezerTrack {
  id: number
  title: string
  preview: string // URL 30s mp3
  artist: DeezerArtist
  album: {
    id: number
    title: string
    cover_medium: string
  }
}

export interface DeezerChartResponse {
  data: DeezerTrack[]
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

export const WIN_SCORE = 5   // quante corrette per vincere
export const MAX_LIVES = 3
