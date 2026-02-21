import { Suspense } from 'react'
import { GameController } from '@/components/GameController'
import { GameSkeleton } from '@/components/GameSkeleton'
import { ThemeProvider } from '@/components/ThemeProvider'
import { getThemeForGenre, getGenreById, GENRES } from '@/lib/genres'
import type { Metadata } from 'next'
import type { TrackQuestion } from '@/lib/types'

export const metadata: Metadata = { title: 'Gioca — Music Roulette' }

interface GamePageProps {
  searchParams: Promise<{ genreId?: string }>
}

async function getFirstQuestion(genreId: string): Promise<TrackQuestion> {
  const { fetchTracksByGenre, pickQuestionTracks, buildQuestion } = await import('@/lib/itunes')
  const genre = getGenreById(genreId) ?? GENRES[0]
  const tracks = await fetchTracksByGenre(genre.searchTerms)
  const { correct, fakes } = pickQuestionTracks(tracks, 3)
  return buildQuestion(correct, fakes)
}

export default async function GamePage({ searchParams }: GamePageProps) {
  const params = await searchParams
  const genreId = params.genreId ?? GENRES[0].id
  const genre = getGenreById(genreId) ?? GENRES[0]
  const theme = getThemeForGenre(genreId)
  const firstQuestionPromise = getFirstQuestion(genreId)

  return (
    <ThemeProvider theme={theme}>
      <div className="game-page">
        <nav className="game-nav" aria-label="Navigazione principale">
          <a href="/genres" className="game-nav__back" aria-label="Torna alla selezione genere">
            ← Generi
          </a>
          <span className="game-nav__title" aria-hidden="true">
            {genre.emoji} {genre.name}
          </span>
        </nav>
        <Suspense fallback={<GameSkeleton />}>
          <GameController firstQuestionPromise={firstQuestionPromise} genreId={genreId} />
        </Suspense>
      </div>
    </ThemeProvider>
  )
}
