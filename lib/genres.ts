import type { GenreTheme } from './types'

/**
 * Mappa gli ID genere Deezer a temi visivi.
 * Gli ID sono quelli reali della API /genre di Deezer.
 *
 * Per ogni genere senza tema esplicito si usa DEFAULT_THEME.
 */
export const GENRE_THEMES: Record<number, GenreTheme> = {
  // Pop
  132: {
    accent: '#ff6eb4',
    accentGlow: '#ff6eb440',
    bg: '#130008',
    bgSurface: '#1e000f',
  },
  // Rock
  152: {
    accent: '#ff4500',
    accentGlow: '#ff450040',
    bg: '#130200',
    bgSurface: '#1e0500',
  },
  // Rap / Hip-Hop
  116: {
    accent: '#ffd700',
    accentGlow: '#ffd70040',
    bg: '#0f0d00',
    bgSurface: '#1a1500',
  },
  // Electro
  106: {
    accent: '#00ffcc',
    accentGlow: '#00ffcc40',
    bg: '#00100d',
    bgSurface: '#001a15',
  },
  // Jazz
  129: {
    accent: '#c8a96e',
    accentGlow: '#c8a96e40',
    bg: '#0d0900',
    bgSurface: '#1a1200',
  },
  // R&B
  165: {
    accent: '#b06aff',
    accentGlow: '#b06aff40',
    bg: '#0d0020',
    bgSurface: '#160030',
  },
  // Dance
  113: {
    accent: '#00cfff',
    accentGlow: '#00cfff40',
    bg: '#000d14',
    bgSurface: '#00141e',
  },
  // Reggae
  144: {
    accent: '#44cc44',
    accentGlow: '#44cc4440',
    bg: '#020d02',
    bgSurface: '#041504',
  },
  // Classical
  98: {
    accent: '#e8d5b0',
    accentGlow: '#e8d5b040',
    bg: '#0d0c08',
    bgSurface: '#181610',
  },
  // Metal
  464: {
    accent: '#cccccc',
    accentGlow: '#cccccc40',
    bg: '#080808',
    bgSurface: '#121212',
  },
  // Soul & Funk
  169: {
    accent: '#ff9a3c',
    accentGlow: '#ff9a3c40',
    bg: '#100600',
    bgSurface: '#1a0e00',
  },
  // Alternative
  85: {
    accent: '#a8ff78',
    accentGlow: '#a8ff7840',
    bg: '#041002',
    bgSurface: '#081a04',
  },
  // Country
  84: {
    accent: '#d4a843',
    accentGlow: '#d4a84340',
    bg: '#0d0800',
    bgSurface: '#1a1200',
  },
  // Latino
  197: {
    accent: '#ff5252',
    accentGlow: '#ff525240',
    bg: '#130000',
    bgSurface: '#200000',
  },
  // Films/Games
  153: {
    accent: '#7eb8ff',
    accentGlow: '#7eb8ff40',
    bg: '#00080f',
    bgSurface: '#000f1a',
  },
}

export const DEFAULT_THEME: GenreTheme = {
  accent: '#e8ff47',
  accentGlow: '#e8ff4740',
  bg: '#0a0a0f',
  bgSurface: '#13131e',
}

/**
 * Restituisce il tema per un genreId.
 * Se non esiste una entry specifica, usa il DEFAULT_THEME.
 */
export function getThemeForGenre(genreId: number | null): GenreTheme {
  if (!genreId) return DEFAULT_THEME
  return GENRE_THEMES[genreId] ?? DEFAULT_THEME
}

/**
 * Genera le CSS custom properties da iniettare come style inline
 * sul wrapper del gioco. Sovrascrive le variabili definite in globals.css.
 */
export function themeToCSSVars(theme: GenreTheme): React.CSSProperties {
  return {
    '--accent-primary': theme.accent,
    '--accent-glow': theme.accentGlow,
    '--bg-base': theme.bg,
    '--bg-surface': theme.bgSurface,
    '--bg-elevated': adjustBrightness(theme.bgSurface, 1.4),
  } as React.CSSProperties
}

/** Schiarisce leggermente un colore hex per bg-elevated */
function adjustBrightness(hex: string, factor: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const clamp = (v: number) => Math.min(255, Math.round(v * factor))
  return `rgb(${clamp(r)}, ${clamp(g)}, ${clamp(b)})`
}
