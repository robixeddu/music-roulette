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
        const isSelected  = selectedId === option.id
        const showFeedback = selectedId !== null

        let state: 'idle' | 'correct' | 'wrong' = 'idle'
        if (showFeedback) {
          if (option.isCorrect) state = 'correct'
          else if (isSelected)  state = 'wrong'
        }

        const feedbackId = `feedback-${option.id}`
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
            onClick={() => !disabled && onSelect(option)}
            disabled={disabled}
            aria-pressed={isSelected}
            aria-describedby={showFeedback ? feedbackId : undefined}
          >
            <span className={styles.label}>{option.label}</span>
            <span
              id={feedbackId}
              className={styles.feedback}
              aria-hidden={!showFeedback}
              aria-label={
                state === 'correct' ? 'Risposta corretta'
                : state === 'wrong' ? 'Risposta sbagliata'
                : undefined
              }
            >
              {state === 'correct' && '✓'}
              {state === 'wrong'   && '✗'}
            </span>
          </button>
        )
      })}
    </div>
  )
}
