import { Suspense } from 'react'
import { GameController } from '@/components/GameController'
import { GameSkeleton } from '@/components/GameSkeleton'
import { ThemeProvider } from '@/components/ThemeProvider'
import { DEFAULT_THEME } from '@/lib/genres'
import type { Metadata } from 'next'
import type { TrackQuestion } from '@/lib/types'

export const metadata: Metadata = { title: 'Artista — Music Roulette' }

interface ArtistPageProps {
  searchParams: Promise<{ artist?: string }>
}

async function getFirstQuestion(artist: string): Promise<TrackQuestion> {
  const { fetchTracksByArtist, pickQuestionTracks, buildArtistQuestion } = await import('@/lib/itunes')
  const tracks = await fetchTracksByArtist(artist)
  if (tracks.length < 4) {
    throw new Error(`Brani insufficienti per "${artist}" su iTunes (trovati: ${tracks.length}).`)
  }
  const { correct, fakes } = pickQuestionTracks(tracks, 3)
  return buildArtistQuestion(correct, fakes)
}

export default async function ArtistPage({ searchParams }: ArtistPageProps) {
  const params = await searchParams
  const artist = params.artist ?? ''

  if (!artist.trim()) {
    return (
      <ThemeProvider theme={DEFAULT_THEME}>
        <div className="game-page">
          <nav className="game-nav">
            <a href="/" className="game-nav__back">← Home</a>
          </nav>
          <div className="artist-error">
            <p>Nessun artista specificato.</p>
            <a href="/" className="btn btn--primary">Torna alla home</a>
          </div>
        </div>
      </ThemeProvider>
    )
  }

  const firstQuestionPromise = getFirstQuestion(artist)

  return (
    <ThemeProvider theme={DEFAULT_THEME}>
      <div className="game-page">
        <nav className="game-nav" aria-label="Navigazione principale">
          <a href="/" className="game-nav__back" aria-label="Torna alla home">
            ← Home
          </a>
          <span className="game-nav__title" aria-hidden="true">
            🎤 {artist}
          </span>
        </nav>
        <Suspense fallback={<GameSkeleton />}>
          <GameController
            firstQuestionPromise={firstQuestionPromise}
            genreId={`artist:${encodeURIComponent(artist)}`}
            apiPath="/api/artist-track"
            apiParam="artist"
            apiValue={artist}
          />
        </Suspense>
      </div>
    </ThemeProvider>
  )
}
