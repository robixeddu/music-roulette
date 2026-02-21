import type { Genre, GenreTheme } from './types'

/**
 * Generi supportati con i relativi parametri di ricerca iTunes
 * e tema visivo. iTunes non ha una "chart per genere" pubblica,
 * quindi cerchiamo per termine + genreIndex implicito.
 *
 * I searchTerm sono ottimizzati per restituire brani popolari
 * e ben riconoscibili per quel genere.
 */
export const GENRES: Genre[] = [
  { id: 'pop',         name: 'Pop',           emoji: '🎤', searchTerm: 'top pop hits' },
  { id: 'rock',        name: 'Rock',          emoji: '🎸', searchTerm: 'classic rock hits' },
  { id: 'hiphop',      name: 'Hip-Hop',       emoji: '🎧', searchTerm: 'hip hop rap hits' },
  { id: 'electronic',  name: 'Electronic',    emoji: '🎹', searchTerm: 'electronic dance music hits' },
  { id: 'jazz',        name: 'Jazz',          emoji: '🎷', searchTerm: 'jazz classics' },
  { id: 'rnb',         name: 'R&B',           emoji: '🎵', searchTerm: 'rnb soul hits' },
  { id: 'latin',       name: 'Latino',        emoji: '💃', searchTerm: 'latin hits reggaeton' },
  { id: 'metal',       name: 'Metal',         emoji: '🤘', searchTerm: 'heavy metal rock hits' },
  { id: 'country',     name: 'Country',       emoji: '🤠', searchTerm: 'country music hits' },
  { id: 'classical',   name: 'Classical',     emoji: '🎻', searchTerm: 'classical music orchestra' },
  { id: 'reggae',      name: 'Reggae',        emoji: '🌴', searchTerm: 'reggae hits bob marley' },
  { id: 'blues',       name: 'Blues',         emoji: '🎺', searchTerm: 'blues music hits' },
  { id: 'funk',        name: 'Funk & Soul',   emoji: '🕺', searchTerm: 'funk soul hits' },
  { id: 'punk',        name: 'Punk',          emoji: '⚡', searchTerm: 'punk rock hits' },
  { id: 'kpop',        name: 'K-Pop',         emoji: '🌸', searchTerm: 'kpop hits bts blackpink' },
]

export const GENRE_THEMES: Record<string, GenreTheme> = {
  pop:        { accent: '#ff6eb4', accentGlow: '#ff6eb440', bg: '#130008', bgSurface: '#1e000f' },
  rock:       { accent: '#ff4500', accentGlow: '#ff450040', bg: '#130200', bgSurface: '#1e0500' },
  hiphop:     { accent: '#ffd700', accentGlow: '#ffd70040', bg: '#0f0d00', bgSurface: '#1a1500' },
  electronic: { accent: '#00ffcc', accentGlow: '#00ffcc40', bg: '#00100d', bgSurface: '#001a15' },
  jazz:       { accent: '#c8a96e', accentGlow: '#c8a96e40', bg: '#0d0900', bgSurface: '#1a1200' },
  rnb:        { accent: '#b06aff', accentGlow: '#b06aff40', bg: '#0d0020', bgSurface: '#160030' },
  latin:      { accent: '#ff5252', accentGlow: '#ff525240', bg: '#130000', bgSurface: '#200000' },
  metal:      { accent: '#cccccc', accentGlow: '#cccccc40', bg: '#080808', bgSurface: '#121212' },
  country:    { accent: '#d4a843', accentGlow: '#d4a84340', bg: '#0d0800', bgSurface: '#1a1200' },
  classical:  { accent: '#e8d5b0', accentGlow: '#e8d5b040', bg: '#0d0c08', bgSurface: '#181610' },
  reggae:     { accent: '#44cc44', accentGlow: '#44cc4440', bg: '#020d02', bgSurface: '#041504' },
  blues:      { accent: '#4488ff', accentGlow: '#4488ff40', bg: '#000820', bgSurface: '#000f30' },
  funk:       { accent: '#ff9a3c', accentGlow: '#ff9a3c40', bg: '#100600', bgSurface: '#1a0e00' },
  punk:       { accent: '#ff1493', accentGlow: '#ff149340', bg: '#130010', bgSurface: '#1e0018' },
  kpop:       { accent: '#ff85c8', accentGlow: '#ff85c840', bg: '#130010', bgSurface: '#200018' },
}

export const DEFAULT_THEME: GenreTheme = {
  accent: '#e8ff47',
  accentGlow: '#e8ff4740',
  bg: '#0a0a0f',
  bgSurface: '#13131e',
}

export function getGenreById(id: string): Genre | undefined {
  return GENRES.find(g => g.id === id)
}

export function getThemeForGenre(genreId: string | null): GenreTheme {
  if (!genreId) return DEFAULT_THEME
  return GENRE_THEMES[genreId] ?? DEFAULT_THEME
}

export function themeToCSSVars(theme: GenreTheme): React.CSSProperties {
  return {
    '--accent-primary': theme.accent,
    '--accent-glow': theme.accentGlow,
    '--bg-base': theme.bg,
    '--bg-surface': theme.bgSurface,
    '--bg-elevated': adjustBrightness(theme.bgSurface, 1.4),
  } as React.CSSProperties
}

function adjustBrightness(hex: string, factor: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const clamp = (v: number) => Math.min(255, Math.round(v * factor))
  return `rgb(${clamp(r)}, ${clamp(g)}, ${clamp(b)})`
}
