'use client'

import dynamic from 'next/dynamic'
import { BoardSkeleton } from './BoardSkeleton'
import type { GameMode } from './GameController'

// ssr: false garantisce che GameController giri solo sul client:
// fetchQuestion usa /api/track (URL relativo, solo client), e la promise
// creata nel lazy useState è pending → QuestionView suspende → skeleton visibile
const GameControllerDynamic = dynamic(
  () => import('./GameController').then(m => ({ default: m.GameController })),
  { ssr: false, loading: () => <BoardSkeleton /> }
)

interface Props {
  gameMode: GameMode
}

export function GameControllerClient({ gameMode }: Props) {
  return <GameControllerDynamic gameMode={gameMode} />
}