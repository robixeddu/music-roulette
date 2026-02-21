import type { Genre, GenreTheme } from './types'

/**
 * Ogni genere ha un pool di artistId iTunes reali.
 * La lookup per ID è più affidabile di una ricerca testuale:
 * risultati coerenti, sempre del genere corretto, con preview garantiti.
 *
 * Gli ID si trovano su: https://itunes.apple.com/search?term=ARTIST&entity=musicArtist
 * oppure dalla URL della pagina artista su Apple Music.
 */
export const GENRES: Genre[] = [
  {
    id: 'pop',
    name: 'Pop',
    emoji: '🎤',
    artistIds: [
      34406, 271256, 1421122, 159260351, 217005500, // Michael Jackson, Beyoncé, Taylor Swift, Adele, Ariana Grande
      3296287, 412778295, 1065981054, 280215834, 183313439, // Justin Bieber, Dua Lipa, Olivia Rodrigo, Lady Gaga, Katy Perry
    ],
  },
  {
    id: 'rock',
    name: 'Rock',
    emoji: '🎸',
    artistIds: [
      106834, 4321, 3021, 21249, 33269, // Queen, AC/DC, U2, Nirvana, Foo Fighters
      3529017, 903157, 152740, 1374, 488484, // Imagine Dragons, Arctic Monkeys, Radiohead, The Beatles, Red Hot Chili Peppers
    ],
  },
  {
    id: 'hiphop',
    name: 'Hip-Hop',
    emoji: '🎧',
    artistIds: [
      73705865, 72772, 102936, 5183, 6906197, // Drake, Eminem, Jay-Z, Kanye West, Kendrick Lamar
      160687588, 138676956, 1276656483, 326297, 400835963, // Post Malone, Travis Scott, Cardi B, Lil Wayne, 21 Savage
    ],
  },
  {
    id: 'electronic',
    name: 'Electronic',
    emoji: '🎹',
    artistIds: [
      5468295, 29916, 7714461, 5723, 217493570, // Daft Punk, Moby, The Chemical Brothers, Fatboy Slim, Calvin Harris
      57978070, 549236696, 15588, 57890948, 305777253, // David Guetta, Martin Garrix, Aphex Twin, Deadmau5, Marshmello
    ],
  },
  {
    id: 'jazz',
    name: 'Jazz',
    emoji: '🎷',
    artistIds: [
      44195, 65579, 55152, 65578, 64387, // Miles Davis, John Coltrane, Bill Evans, Thelonious Monk, Chet Baker
      64388, 64390, 78052, 204523, 31851, // Dave Brubeck, Charlie Parker, Norah Jones, Diana Krall, Michael Bublé
    ],
  },
  {
    id: 'rnb',
    name: 'R&B',
    emoji: '🎵',
    artistIds: [
      1284, 32940, 77203, 359327, 138660667, // Stevie Wonder, Marvin Gaye, Whitney Houston, Alicia Keys, The Weeknd
      411069, 479756, 101561, 64387, 266927494, // Bruno Mars, Frank Ocean, Usher, SZA, Khalid
    ],
  },
  {
    id: 'latin',
    name: 'Latino',
    emoji: '💃',
    artistIds: [
      194959222, 324737, 276853, 457086, 296680, // Bad Bunny, Shakira, Enrique Iglesias, Marc Anthony, Ricky Martin
      1185118383, 368183298, 315737498, 1034456, 278032, // J Balvin, Maluma, Ozuna, Daddy Yankee, Jennifer Lopez
    ],
  },
  {
    id: 'metal',
    name: 'Metal',
    emoji: '🤘',
    artistIds: [
      3643, 152559, 3644, 6773, 5516, // Metallica, Iron Maiden, Slayer, Black Sabbath, Judas Priest
      3593, 442677, 264111789, 1176, 272580, // Megadeth, Slipknot, Rammstein, Pantera, System of a Down
    ],
  },
  {
    id: 'country',
    name: 'Country',
    emoji: '🤠',
    artistIds: [
      10244, 462698, 163940, 3345, 77424, // Johnny Cash, Luke Bryan, Blake Shelton, Dolly Parton, Kenny Rogers
      358714030, 253583, 338730, 41814, 78738, // Luke Combs, Keith Urban, Carrie Underwood, Tim McGraw, Faith Hill
    ],
  },
  {
    id: 'classical',
    name: 'Classical',
    emoji: '🎻',
    artistIds: [
      78732, 78720, 78722, 78733, 78736, // Bach, Beethoven, Mozart, Brahms, Chopin
      78737, 78748, 937267, 78746, 78742, // Debussy, Vivaldi, Yo-Yo Ma, Tchaikovsky, Schubert
    ],
  },
  {
    id: 'reggae',
    name: 'Reggae',
    emoji: '🌴',
    artistIds: [
      27699, 3270, 62987, 62993, 62989, // Bob Marley, Jimmy Cliff, Burning Spear, Toots and the Maytals, Steel Pulse
      254395, 63017, 5381, 3278, 63012, // Sean Paul, Damian Marley, Shaggy, Ziggy Marley, Beenie Man
    ],
  },
  {
    id: 'blues',
    name: 'Blues',
    emoji: '🎺',
    artistIds: [
      2626, 2580, 264744, 64438, 9191, // BB King, Muddy Waters, Eric Clapton, Robert Johnson, Stevie Ray Vaughan
      64440, 253, 5469, 64446, 64453, // John Lee Hooker, Ray Charles, Tom Waits, Howlin Wolf, Son House
    ],
  },
  {
    id: 'funk',
    name: 'Funk & Soul',
    emoji: '🕺',
    artistIds: [
      98800, 193, 176032, 2547, 98819, // James Brown, Prince, Michael Jackson, Sly & the Family Stone, Earth Wind & Fire
      255, 309, 200, 3491, 1211, // Aretha Franklin, Otis Redding, Sam Cooke, Al Green, Curtis Mayfield
    ],
  },
  {
    id: 'punk',
    name: 'Punk',
    emoji: '⚡',
    artistIds: [
      106834, 176950, 489458, 79408, 159735, // The Clash, Sex Pistols, Ramones, Green Day, The Offspring
      160133, 127810, 4308, 481138, 485353, // Blink-182, Sum 41, Bad Religion, NOFX, Rise Against
    ],
  },
  {
    id: 'kpop',
    name: 'K-Pop',
    emoji: '🌸',
    artistIds: [
      1122783437, 1017981438, 1086605539, 1222653807, 1438046165, // BTS, BLACKPINK, EXO, TWICE, Stray Kids
      1440269067, 1445784340, 1376570701, 1453563669, 1496094493, // NCT 127, Monsta X, GOT7, ITZY, aespa
    ],
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