'use client'

import { MAX_LIVES } from '@/lib/types'

interface LivesIndicatorProps {
  lives: number
}

/**
 * Mostra le vite rimaste come cuori.
 * Usa aria-label per screen reader: non solo i simboli visivi.
 */
export function LivesIndicator({ lives }: LivesIndicatorProps) {
  return (
    <div
      className="lives-indicator"
      role="status"
      aria-label={`Vite rimaste: ${lives} su ${MAX_LIVES}`}
      aria-live="polite"
    >
      {Array.from({ length: MAX_LIVES }).map((_, i) => (
        <span
          key={i}
          className={`heart ${i < lives ? 'heart--active' : 'heart--lost'}`}
          aria-hidden="true"
        >
          {i < lives ? '♥' : '♡'}
        </span>
      ))}
    </div>
  )
}
