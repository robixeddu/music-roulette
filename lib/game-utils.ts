import { shuffleArray } from "./itunes";
import type {
  TrackOption,
  TrackQuestion,
  GameState,
  iTunesTrack,
} from "./types";
import { WIN_SCORE, MAX_LIVES } from "./types";

/**
 * Trasforma una DeezerTrack in un TrackOption da mostrare all'utente.
 */
export function trackToOption(
  track: iTunesTrack,
  isCorrect: boolean
): TrackOption {
  return {
    id: track.trackId,
    label: `${track.artistName} — ${track.trackName}`,
    isCorrect,
  };
}

/**
 * Costruisce un TrackQuestion completo da mandare al client:
 * previewUrl, albumCover, e le opzioni già shufflate.
 */
export function buildQuestion(
  correct: iTunesTrack,
  fakes: iTunesTrack[]
): TrackQuestion {
  const options: TrackOption[] = shuffleArray([
    trackToOption(correct, true),
    ...fakes.map((f) => trackToOption(f, false)),
  ]);

  return {
    previewUrl: correct.previewUrl,
    albumCover: correct.artworkUrl100,
    options,
  };
}

/**
 * Calcola il nuovo GameState dopo una risposta dell'utente.
 * Funzione pura — nessun side effect, facilissima da testare.
 */
export function applyGuess(state: GameState, isCorrect: boolean): GameState {
  if (state.status !== "playing") return state;

  if (isCorrect) {
    const newScore = state.score + 1;
    return {
      ...state,
      score: newScore,
      status: newScore >= WIN_SCORE ? "won" : "playing",
    };
  } else {
    const newLives = state.lives - 1;
    return {
      ...state,
      lives: newLives,
      status: newLives <= 0 ? "lost" : "playing",
    };
  }
}

/**
 * Genera il messaggio del premio in base al punteggio.
 * Espandibile con un array di premi se vuoi aggiungerne altri.
 */
export function getPrize(score: number): { emoji: string; message: string } {
  if (score >= WIN_SCORE) {
    return { emoji: "🏆", message: "Sei un vero intenditore musicale!" };
  }
  return { emoji: "🎵", message: "Riprova, ci sei quasi!" };
}

/** Formatta il punteggio come stringa leggibile */
export function formatScore(score: number): string {
  return `${score} / ${WIN_SCORE}`;
}

/** Restituisce true se il gioco è terminato (vinto o perso) */
export function isGameOver(state: GameState): boolean {
  return state.status === "won" || state.status === "lost";
}
