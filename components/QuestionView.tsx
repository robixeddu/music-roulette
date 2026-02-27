'use client'

import { use } from 'react'
import Image from 'next/image'
import type { TrackQuestion, TrackOption } from '@/lib/types'
import { AudioPlayer } from './AudioPlayer'
import { ChoiceList } from './ChoiceList'
import styles from './QuestionView.module.css'

interface QuestionViewProps {
  questionPromise: Promise<TrackQuestion>
  selectedId: number | null
  onSelect: (option: TrackOption) => void
  onFirstPlay?: () => void
}

export function QuestionView({ questionPromise, selectedId, onSelect, onFirstPlay }: QuestionViewProps) {
  const question = use(questionPromise)

  const result = selectedId === null
    ? 'idle'
    : question.options.find(o => o.id === selectedId)?.isCorrect
      ? 'correct'
      : 'wrong'

  // La cover si svela quando l'utente ha risposto correttamente
  // (sostituisce il selettore :has() cross-component che non è modulabile)
  const coverRevealed = selectedId !== null && result === 'correct'

  return (
    <div className={styles.view}>
      <div className={styles.coverWrap}>
        <Image
          src={question.albumCover}
          alt="Copertina album — prova a indovinare la canzone!"
          width={200}
          height={200}
          className={`${styles.cover} ${coverRevealed ? styles.coverRevealed : ''}`}
          priority
        />
        <div className={styles.coverOverlay} aria-hidden="true" />
      </div>

      <AudioPlayer src={question.previewUrl} onFirstPlay={onFirstPlay} />

      <p className="sr-only">
        Ascolta l&apos;estratto e scegli l&apos;artista e il titolo corretti tra le opzioni.
      </p>

      <ChoiceList
        options={question.options}
        selectedId={selectedId}
        result={result}
        onSelect={onSelect}
        disabled={selectedId !== null}
      />
    </div>
  )
}
