import { Suspense } from 'react'
import { GameController } from '@/components/GameController'
import { GameSkeleton } from '@/components/GameSkeleton'
import { ThemeProvider } from '@/components/ThemeProvider'
import { getThemeForGenre } from '@/lib/genres'
import type { Metadata } from 'next'
import type { TrackQuestion } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Gioca — Music Roulette',
}

interface GamePageProps {
  searchParams: Promise<{ genreId?: string; genreName?: string }>
}

async function getFirstQuestion(genreId: number): Promise<TrackQuestion> {
  const { fetchChartTracks, pickQuestionTracks } = await import('@/lib/deezer')
  const { buildQuestion } = await import('@/lib/game-utils')
  const tracks = await fetchChartTracks(genreId)
  const { correct, fakes } = pickQuestionTracks(tracks, 3)
  return buildQuestion(correct, fakes)
}

/**
 * Game page — RSC shell.
 *
 * Legge genreId dai searchParams (Promise in Next.js 15),
 * calcola il tema server-side, passa la prima domanda come Promise
 * NON-awaited a GameController.
 *
 * Il Suspense qui gestisce solo il primo render (hydration).
 * I loading successivi sono gestiti dal Suspense interno a GameController,
 * così l'header con vite e punteggio non sparisce durante le transizioni.
 */
export default async function GamePage({ searchParams }: GamePageProps) {
  const params = await searchParams
  const genreId = Number(params.genreId ?? 0)
  const genreName = params.genreName ?? 'Global'

  const theme = getThemeForGenre(genreId)

  // NON await: passiamo la Promise a GameController
  const firstQuestionPromise = getFirstQuestion(genreId)

  return (
    <ThemeProvider theme={theme}>
      <div className="game-page">
        <nav className="game-nav" aria-label="Navigazione principale">
          <a href="/genres" className="game-nav__back" aria-label="Torna alla selezione genere">
            ← Generi
          </a>
          <span className="game-nav__title" aria-hidden="true">
            {genreName}
          </span>
        </nav>

        {/* Suspense esterno: solo per il primo render prima dell'hydration */}
        <Suspense fallback={<GameSkeleton />}>
          <GameController
            firstQuestionPromise={firstQuestionPromise}
            genreId={genreId}
          />
        </Suspense>
      </div>
    </ThemeProvider>
  )
}
