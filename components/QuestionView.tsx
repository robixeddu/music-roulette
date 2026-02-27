'use client'

import { use, useEffect, useRef } from 'react'
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
  const playBtnRef = useRef<HTMLButtonElement>(null)

  // Focus automatico sul bottone play ad ogni nuova domanda
  useEffect(() => {
    playBtnRef.current?.focus()
  }, [question])

  const result = selectedId === null
    ? 'idle'
    : question.options.find(o => o.id === selectedId)?.isCorrect
      ? 'correct'
      : 'wrong'

  // Cover svelata sia su corretto che su sbagliato, con stato per colorazione
  const coverRevealed = selectedId !== null

  return (
    <div className={styles.view}>
      <div className={styles.coverWrap}>
        <Image
          src={question.albumCover}
          alt="Copertina album — prova a indovinare la canzone!"
          width={200}
          height={200}
          className={[
            styles.cover,
            coverRevealed ? styles.coverRevealed : '',
            coverRevealed && result === 'wrong' ? styles.coverWrong : '',
          ].filter(Boolean).join(' ')}
          priority
        />
        <div className={styles.coverOverlay} aria-hidden="true" />
      </div>

      <AudioPlayer
        src={question.previewUrl}
        onFirstPlay={onFirstPlay}
        playBtnRef={playBtnRef}
        autoplay={true}
      />

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