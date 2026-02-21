import type { Genre, GenreTheme } from './types'

/**
 * Ogni genere ha un array di termini di ricerca iTunes specifici per artista.
 * Usiamo ricerca per nome artista + "songs" invece di ID numerici
 * (gli ID cambiano tra regioni e nel tempo).
 *
 * fetchTracksByGenre prova i termini in parallelo e aggrega i risultati.
 */
export const GENRES: Genre[] = [
  {
    id: 'pop',
    name: 'Pop',
    emoji: '🎤',
    searchTerms: ['Michael Jackson', 'Taylor Swift', 'Beyonce', 'Adele', 'Ariana Grande', 'Katy Perry', 'Lady Gaga', 'Justin Timberlake'],
  },
  {
    id: 'rock',
    name: 'Rock',
    emoji: '🎸',
    searchTerms: ['Queen', 'AC DC', 'Nirvana', 'Foo Fighters', 'U2', 'The Beatles', 'Red Hot Chili Peppers', 'Imagine Dragons'],
  },
  {
    id: 'hiphop',
    name: 'Hip-Hop',
    emoji: '🎧',
    searchTerms: ['Eminem', 'Drake', 'Kanye West', 'Jay-Z', 'Kendrick Lamar', 'Post Malone', 'Lil Wayne', 'Nicki Minaj'],
  },
  {
    id: 'electronic',
    name: 'Electronic',
    emoji: '🎹',
    searchTerms: ['Daft Punk', 'Calvin Harris', 'David Guetta', 'The Chemical Brothers', 'Fatboy Slim', 'Deadmau5', 'Moby', 'Aphex Twin'],
  },
  {
    id: 'jazz',
    name: 'Jazz',
    emoji: '🎷',
    searchTerms: ['Miles Davis', 'John Coltrane', 'Bill Evans', 'Dave Brubeck', 'Norah Jones', 'Diana Krall', 'Thelonious Monk', 'Chet Baker'],
  },
  {
    id: 'rnb',
    name: 'R&B',
    emoji: '🎵',
    searchTerms: ['Stevie Wonder', 'Marvin Gaye', 'Whitney Houston', 'Alicia Keys', 'The Weeknd', 'Bruno Mars', 'Usher', 'Frank Ocean'],
  },
  {
    id: 'latin',
    name: 'Latino',
    emoji: '💃',
    searchTerms: ['Bad Bunny', 'Shakira', 'J Balvin', 'Daddy Yankee', 'Ricky Martin', 'Enrique Iglesias', 'Maluma', 'Jennifer Lopez'],
  },
  {
    id: 'metal',
    name: 'Metal',
    emoji: '🤘',
    searchTerms: ['Metallica', 'Iron Maiden', 'Black Sabbath', 'Megadeth', 'Slipknot', 'System of a Down', 'Rammstein', 'Pantera'],
  },
  {
    id: 'country',
    name: 'Country',
    emoji: '🤠',
    searchTerms: ['Johnny Cash', 'Dolly Parton', 'Luke Bryan', 'Carrie Underwood', 'Blake Shelton', 'Keith Urban', 'Tim McGraw', 'Luke Combs'],
  },
  {
    id: 'classical',
    name: 'Classical',
    emoji: '🎻',
    searchTerms: ['Mozart', 'Beethoven', 'Bach', 'Chopin', 'Vivaldi', 'Debussy', 'Tchaikovsky', 'Yo-Yo Ma'],
  },
  {
    id: 'reggae',
    name: 'Reggae',
    emoji: '🌴',
    searchTerms: ['Bob Marley', 'Jimmy Cliff', 'Sean Paul', 'Shaggy', 'Damian Marley', 'Ziggy Marley', 'Burning Spear', 'Toots Maytals'],
  },
  {
    id: 'blues',
    name: 'Blues',
    emoji: '🎺',
    searchTerms: ['BB King', 'Muddy Waters', 'Eric Clapton', 'Stevie Ray Vaughan', 'John Lee Hooker', 'Ray Charles', 'Howlin Wolf', 'Robert Johnson'],
  },
  {
    id: 'funk',
    name: 'Funk & Soul',
    emoji: '🕺',
    searchTerms: ['James Brown', 'Prince', 'Sly Stone', 'Earth Wind Fire', 'Aretha Franklin', 'Otis Redding', 'Al Green', 'Curtis Mayfield'],
  },
  {
    id: 'punk',
    name: 'Punk',
    emoji: '⚡',
    searchTerms: ['The Clash', 'Ramones', 'Sex Pistols', 'Green Day', 'Blink-182', 'The Offspring', 'Bad Religion', 'Rise Against'],
  },
  {
    id: 'kpop',
    name: 'K-Pop',
    emoji: '🌸',
    searchTerms: ['BTS', 'BLACKPINK', 'EXO', 'TWICE', 'Stray Kids', 'NCT 127', 'ITZY', 'aespa'],
  },
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
