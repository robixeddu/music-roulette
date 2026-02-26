/**
 * Definizione livelli di gioco.
 * Il livello avanza automaticamente dopo ogni vittoria.
 * WIN_SCORE varia per livello; vite sempre 3.
 */

export interface Level {
  id: number
  name: string
  winScore: number   // domande da vincere per completare il livello
  multiplier: number // moltiplicatore per il punteggio classifica
}

export const LEVELS: Level[] = [
  { id: 1, name: 'Rookie',  winScore: 5,  multiplier: 1 },
  { id: 2, name: 'Arcade',  winScore: 8,  multiplier: 2 },
  { id: 3, name: 'Expert',  winScore: 12, multiplier: 3 },
  { id: 4, name: 'Master',  winScore: 15, multiplier: 5 },
]

export const MAX_LEVEL = LEVELS.length

/** Ritorna il livello dato il suo id (1-based). Fallback al livello 1. */
export function getLevelById(id: number): Level {
  return LEVELS.find(l => l.id === id) ?? LEVELS[0]
}

/** Ritorna il livello successivo, o null se è già al massimo. */
export function getNextLevel(current: Level): Level | null {
  return LEVELS.find(l => l.id === current.id + 1) ?? null
}

/**
 * Moltiplicatore tempo basato sulla media ms di risposta per domanda corretta.
 * null = l'utente non ha mai premuto play → nessun bonus (×1.0)
 *
 * < 5s  → ×2.0  (risposta fulminea)
 * < 10s → ×1.5  (risposta rapida)
 * < 20s → ×1.0  (risposta normale)
 * ≥ 20s → ×0.5  (risposta lenta)
 */
export function getTimeMultiplier(avgTimeMs: number | null): number {
  if (avgTimeMs === null) return 1.0
  const s = avgTimeMs / 1000
  if (s < 5)  return 2.0
  if (s < 10) return 1.5
  if (s < 20) return 1.0
  return 0.5
}

/** Label leggibile per il moltiplicatore tempo. */
export function getTimeMultiplierLabel(avgTimeMs: number | null): string {
  const m = getTimeMultiplier(avgTimeMs)
  if (m === 2.0) return '⚡ ×2.0'
  if (m === 1.5) return '🔥 ×1.5'
  if (m === 1.0) return '✓ ×1.0'
  return '🐢 ×0.5'
}

/**
 * Calcola il punteggio classifica finale.
 * score = round(domande_vinte × moltiplicatore_livello × moltiplicatore_tempo)
 */
export function calcLeaderboardScore(
  wonQuestions: number,
  level: Level,
  avgTimeMs: number | null = null
): number {
  return Math.round(wonQuestions * level.multiplier * getTimeMultiplier(avgTimeMs))
}

/** Legge il livello corrente da localStorage. Ritorna livello 1 se assente. */
export function loadLevel(): Level {
  if (typeof window === 'undefined') return LEVELS[0]
  const saved = localStorage.getItem('music-roulette-level')
  const id = saved ? parseInt(saved, 10) : 1
  return getLevelById(id)
}

/** Salva il livello corrente in localStorage. */
export function saveLevel(level: Level): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('music-roulette-level', String(level.id))
}
