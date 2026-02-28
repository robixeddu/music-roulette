'use client'

import type { TrackOption, GuessResult } from '@/lib/types'
import styles from './ChoiceList.module.css'

interface ChoiceListProps {
  options: TrackOption[]
  selectedId: number | null
  result: GuessResult
  onSelect: (option: TrackOption) => void
  disabled: boolean
}

export function ChoiceList({ options, selectedId, result, onSelect, disabled }: ChoiceListProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Scegli l'artista e il titolo della canzone"
      className={styles.list}
    >
      {options.map((option) => {
        const isSelected   = selectedId === option.id
        const showFeedback = selectedId !== null

        let state: 'idle' | 'correct' | 'wrong' = 'idle'
        if (showFeedback) {
          if (option.isCorrect) state = 'correct'
          else if (isSelected)  state = 'wrong'
        }

        // Quando si sbaglia: evidenzia la risposta corretta con label "Era:"
        const isCorrectAfterWrong = showFeedback && result === 'wrong' && option.isCorrect

        const btnClass = [
          styles.btn,
          state === 'correct' ? styles.correct : '',
          state === 'wrong'   ? styles.wrong   : '',
        ].filter(Boolean).join(' ')

        return (
          <button
            key={option.id}
            type="button"
            className={btnClass}
            onClick={() => onSelect(option)}
            disabled={disabled}
            aria-pressed={isSelected}
          >
            <span className={styles.label}>
              {option.label}
            </span>
            {showFeedback && (
              <span className="sr-only">
                {state === 'correct' ? 'Risposta corretta' : state === 'wrong' ? 'Risposta sbagliata' : ''}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}