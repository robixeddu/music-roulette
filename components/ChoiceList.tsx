'use client'

import type { TrackOption, GuessResult } from '@/lib/types'

interface ChoiceListProps {
  options: TrackOption[]
  /** null = nessuna risposta ancora; number = id dell'opzione scelta */
  selectedId: number | null
  result: GuessResult
  onSelect: (option: TrackOption) => void
  disabled: boolean
}

/**
 * Lista di opzioni di risposta.
 *
 * Accessibilità:
 * - role="radiogroup" con aria-label descrive il gruppo
 * - Ogni opzione è un <button> (non un <div>) → keyboard navigabile nativamente
 * - aria-pressed indica la selezione corrente
 * - aria-describedby connette l'esito visivo (corretto/sbagliato) al bottone
 * - Colore non è l'unico indicatore: ✓ e ✗ affiancano i colori
 */
export function ChoiceList({ options, selectedId, result, onSelect, disabled }: ChoiceListProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Scegli l'artista e il titolo della canzone"
      className="choice-list"
    >
      {options.map((option) => {
        const isSelected = selectedId === option.id
        const showFeedback = selectedId !== null

        // Determina lo stato visivo del bottone
        let state: 'idle' | 'correct' | 'wrong' | 'missed' = 'idle'
        if (showFeedback) {
          if (option.isCorrect) state = 'correct'          // sempre evidenzia la corretta
          else if (isSelected) state = 'wrong'             // sbagliata selezionata
        }

        const feedbackId = `feedback-${option.id}`

        return (
          <button
            key={option.id}
            type="button"
            className={`choice-btn choice-btn--${state}`}
            onClick={() => !disabled && onSelect(option)}
            disabled={disabled}
            aria-pressed={isSelected}
            aria-describedby={showFeedback ? feedbackId : undefined}
          >
            <span className="choice-btn__label">{option.label}</span>
            {showFeedback && (
              <span
                id={feedbackId}
                className="choice-btn__feedback"
                aria-label={
                  state === 'correct'
                    ? 'Risposta corretta'
                    : state === 'wrong'
                    ? 'Risposta sbagliata'
                    : undefined
                }
              >
                {state === 'correct' && '✓'}
                {state === 'wrong' && '✗'}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
