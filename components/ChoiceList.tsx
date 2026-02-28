'use client'

import type { TrackOption, GuessResult } from '@/lib/types'
import { useLocale } from '@/hooks/useLocale'
import styles from './ChoiceList.module.css'

interface ChoiceListProps {
  options: TrackOption[]
  selectedId: number | null
  result: GuessResult
  onSelect: (option: TrackOption) => void
  disabled: boolean
}

export function ChoiceList({ options, selectedId, result, onSelect, disabled }: ChoiceListProps) {
  const { t } = useLocale()

  return (
    <div
      role="radiogroup"
      aria-label={t('choices.label')}
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
            <span className={styles.label}>{option.label}</span>
            {showFeedback && (
              <span className="sr-only">
                {state === 'correct' ? t('choices.correct') : state === 'wrong' ? t('choices.wrong') : ''}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}