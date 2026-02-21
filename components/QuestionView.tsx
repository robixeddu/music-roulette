"use client";

import { use } from "react";
import type { TrackQuestion, TrackOption } from "@/lib/types";
import { AudioPlayer } from "./AudioPlayer";
import { ChoiceList } from "./ChoiceList";
import Image from "next/image";
import { proxyAudioUrl } from "@/lib/audio";

interface QuestionViewProps {
  questionPromise: Promise<TrackQuestion>;
  selectedId: number | null;
  onSelect: (option: TrackOption) => void;
}

/**
 * QuestionView — consuma la Promise con use().
 *
 * Questo componente non sa nulla di loading o errori:
 * - Se la Promise è pending → Suspense mostra GameSkeleton
 * - Se la Promise rigetta → ErrorBoundary mostra GameError
 * - Se la Promise si risolve → renderizza la domanda
 *
 * È separato da GameController appositamente: quando questionPromise
 * cambia (nuova domanda), solo QuestionView viene ri-sospeso,
 * mentre GameController (vite, punteggio, header) rimane visibile.
 */
export function QuestionView({
  questionPromise,
  selectedId,
  onSelect,
}: QuestionViewProps) {
  const question = use(questionPromise);

  const result =
    selectedId === null
      ? "idle"
      : question.options.find((o) => o.id === selectedId)?.isCorrect
        ? "correct"
        : "wrong";

  return (
    <div className="question-view">
      <div className="game-board__cover-wrap">
        <Image
          src={question.albumCover}
          alt="Copertina album — prova a indovinare la canzone!"
          width={200}
          height={200}
          className={`game-board__cover ${selectedId !== null ? "game-board__cover--revealed" : ""}`}
          priority
        />
        <div className="game-board__cover-overlay" aria-hidden="true" />
      </div>

      <AudioPlayer src={question.previewUrl} />

      <p className="sr-only">
        Ascolta l&apos;estratto e scegli l&apos;artista e il titolo corretti tra
        le opzioni.
      </p>
      <ChoiceList
        options={question.options}
        selectedId={selectedId}
        result={result}
        onSelect={onSelect}
        disabled={selectedId !== null}
      />
    </div>
  );
}
