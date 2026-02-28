import { Suspense } from 'react'
import { GameController } from '@/components/GameController'
import { GameSkeleton } from '@/components/GameSkeleton'
import { ThemeProvider } from '@/components/ThemeProvider'
import { AppNav } from '@/components/AppNav'
import { getThemeForGenre, getGenreById, GENRES, DEFAULT_THEME } from '@/lib/genres'
import type { Metadata } from 'next'
import type { TrackQuestion } from '@/lib/types'
import styles from './game.module.css'

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
  const params     = await searchParams
  const artistName = params.artistName
  const genreId    = params.genreId ?? GENRES[0].id
  const genre      = getGenreById(genreId) ?? GENRES[0]

  const navTitle  = artistName ? artistName : genre.name
  const backHref  = artistName ? '/' : '/genres'
  const backLabel = artistName ? 'Home' : 'Generi'
  const theme     = artistName ? DEFAULT_THEME : getThemeForGenre(genreId)
  const mode      = artistName
    ? { type: 'artist' as const, artistName }
    : { type: 'genre' as const, genreId }

  const firstQuestionPromise = getFirstQuestion(mode)

  return (
    <ThemeProvider theme={theme}>
      <div className={styles.page}>
        <AppNav backHref={backHref} backLabel={backLabel} title={navTitle} showDot />
        <Suspense fallback={<GameSkeleton />}>
          <GameController firstQuestionPromise={firstQuestionPromise} gameMode={mode} />
        </Suspense>
      </div>
    </ThemeProvider>
  )
}