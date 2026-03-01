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
 * Moltiplicatore streak — premia le risposte consecutive corrette.
 * streak 1-2  → ×1.0 (nessun bonus)
 * streak 3-4  → ×1.5
 * streak 5-6  → ×2.0
 * streak 7+   → ×2.5
 */
export function getStreakMultiplier(streak: number): number {
  if (streak >= 7) return 2.5
  if (streak >= 5) return 2.0
  if (streak >= 3) return 1.5
  return 1.0
}

/**
 * Punteggio per singola risposta corretta.
 * points = round(levelMultiplier × timeMultiplier × streakMultiplier)
 * Minimo 1 punto per risposta.
 */
export function calcAnswerScore(
  level: Level,
  avgTimeMs: number | null,
  streak: number
): number {
  return Math.max(1, Math.round(
    level.multiplier * getTimeMultiplier(avgTimeMs) * getStreakMultiplier(streak)
  ))
}

/**
 * Bonus vite rimanenti al completamento livello.
 * livesLeft × 10 × moltiplicatore_livello
 */
export function calcLivesBonus(livesLeft: number, level: Level): number {
  return livesLeft * 10 * level.multiplier
}

/**
 * Punteggio classifica finale = sessionScore accumulato + bonus vite finali.
 * sessionScore è già calcolato risposta per risposta in applyGuess.
 */
export function calcLeaderboardScore(
  sessionScore: number,
  livesLeft: number,
  level: Level
): number {
  return sessionScore + calcLivesBonus(livesLeft, level)
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