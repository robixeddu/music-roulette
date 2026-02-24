import { Suspense } from 'react'
import { GameController } from '@/components/GameController'
import { GameSkeleton } from '@/components/GameSkeleton'
import { ThemeProvider } from '@/components/ThemeProvider'
import { getThemeForGenre, getGenreById, GENRES, DEFAULT_THEME } from '@/lib/genres'
import type { Metadata } from 'next'
import type { TrackQuestion } from '@/lib/types'

export const metadata: Metadata = { title: 'Gioca — Music Roulette' }

interface GamePageProps {
  searchParams: Promise<{ genreId?: string; artistName?: string }>
}

async function getFirstQuestion(
  mode: { type: 'genre'; genreId: string } | { type: 'artist'; artistName: string }
): Promise<TrackQuestion> {
  const { fetchTracksByGenre, fetchTracksByArtist, pickQuestionTracks, buildQuestion, buildArtistQuestion } =
    await import('@/lib/itunes')

  if (mode.type === 'artist') {
    const tracks = await fetchTracksByArtist(mode.artistName)
    const { correct, fakes } = pickQuestionTracks(tracks, 3)
    return buildArtistQuestion(correct, fakes)
  }

  const genre = getGenreById(mode.genreId) ?? GENRES[0]
  const tracks = await fetchTracksByGenre(genre.searchTerms)
  const { correct, fakes } = pickQuestionTracks(tracks, 3)
  return buildQuestion(correct, fakes)
}

export default async function GamePage({ searchParams }: GamePageProps) {
  const params = await searchParams
  const artistName = params.artistName
  const genreId = params.genreId ?? GENRES[0].id

  // Titolo e tema nella nav
  const navTitle = artistName ? `🎤 ${artistName}` : (() => {
    const g = getGenreById(genreId) ?? GENRES[0]
    return `${g.emoji} ${g.name}`
  })()
  const backHref = artistName ? '/' : '/genres'
  const backLabel = artistName ? 'Home' : 'Generi'
  const theme = artistName ? DEFAULT_THEME : getThemeForGenre(genreId)

  const mode = artistName
    ? { type: 'artist' as const, artistName }
    : { type: 'genre' as const, genreId }

  const firstQuestionPromise = getFirstQuestion(mode)

  return (
    <ThemeProvider theme={theme}>
      <div className="game-page">
        <nav className="game-nav" aria-label="Navigazione principale">
          <a href={backHref} className="game-nav__back" aria-label={`Torna a ${backLabel}`}>
            ← {backLabel}
          </a>
          <span className="game-nav__title" aria-hidden="true">
            {navTitle}
          </span>
        </nav>
        <Suspense fallback={<GameSkeleton />}>
          <GameController
            firstQuestionPromise={firstQuestionPromise}
            gameMode={mode}
          />
        </Suspense>
      </div>
    </ThemeProvider>
  )
}
