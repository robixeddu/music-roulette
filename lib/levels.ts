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
  { id: 2, name: 'Arcade', winScore: 8,  multiplier: 2 },
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
 * Calcola il punteggio classifica.
 * score = domande vinte × moltiplicatore livello
 */
export function calcLeaderboardScore(wonQuestions: number, level: Level): number {
  return wonQuestions * level.multiplier
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
