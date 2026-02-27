/**
 * Definizione livelli di gioco.
 * Il livello avanza automaticamente dopo ogni vittoria.
 * WIN_SCORE varia per livello; vite sempre 3.
 */

export interface Level {
  id: number
  name: string
  winScore: number        // domande da vincere per completare il livello
  multiplier: number      // moltiplicatore per il punteggio classifica
  feedbackDelayMs: number // ms di pausa tra risposta e domanda successiva
}

export const LEVELS: Level[] = [
  { id: 1, name: 'Rookie',  winScore: 5,  multiplier: 1, feedbackDelayMs: 1500 },
  { id: 2, name: 'Arcade',  winScore: 8,  multiplier: 2, feedbackDelayMs: 1200 },
  { id: 3, name: 'Expert',  winScore: 12, multiplier: 3, feedbackDelayMs: 1000 },
  { id: 4, name: 'Master',  winScore: 15, multiplier: 5, feedbackDelayMs: 800  },
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
/**
 * Moltiplicatore tempo CONTINUO — nessuno scaglione.
 * Decresce linearmente: max(0.5, 3.0 − (s / 30) × 2.5)
 *
 *  0s   → ×3.00
 *  5s   → ×2.58
 * 10s   → ×2.17
 * 20s   → ×1.33
 * 30s+  → ×0.50 (cap minimo)
 * null  → ×1.00 (nessun play)
 *
 * Ogni decimo di secondo produce un punteggio diverso → nessuna parità accidentale.
 */
export function getTimeMultiplier(avgTimeMs: number | null): number {
  if (avgTimeMs === null) return 1.0
  const s = avgTimeMs / 1000
  return Math.max(0.5, 3.0 - (s / 30) * 2.5)
}

/** Label velocità per UI — icona indicativa + moltiplicatore esatto. */
export function getTimeMultiplierLabel(avgTimeMs: number | null): string {
  if (avgTimeMs === null) return '— ×1.00'
  const s = avgTimeMs / 1000
  const m = getTimeMultiplier(avgTimeMs)
  const icon = s < 5 ? '⚡' : s < 10 ? '🔥' : s < 20 ? '✓' : '🐢'
  return `${icon} ×${m.toFixed(2)}`
}

/**
 * Calcola il punteggio classifica finale.
 * score = round(domande_vinte × moltiplicatore_livello × moltiplicatore_tempo_continuo)
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