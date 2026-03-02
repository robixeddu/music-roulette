import { GameControllerClient } from '@/components/GameControllerClient'
import { ThemeProvider } from '@/components/ThemeProvider'
import { GameNav } from '@/components/GameNav'
import { getThemeForGenre, getGenreById, GENRES, DEFAULT_THEME } from '@/lib/genres'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Gioca — Music Roulette' }

interface GamePageProps {
  searchParams: Promise<{ genreId?: string; artistName?: string }>
}

export default async function GamePage({ searchParams }: GamePageProps) {
  const params     = await searchParams
  const artistName = params.artistName
  const genreId    = params.genreId ?? GENRES[0].id
  const genre      = getGenreById(genreId) ?? GENRES[0]

  const navTitle = artistName ? artistName : genre.name
  const theme    = artistName ? DEFAULT_THEME : getThemeForGenre(genreId)
  const mode     = artistName
    ? { type: 'artist' as const, artistName }
    : { type: 'genre'  as const, genreId }

  return (
    <ThemeProvider theme={theme}>
      <div className="page">
        <GameNav mode={artistName ? 'artist' : 'genre'} title={navTitle} />
        <GameControllerClient gameMode={mode} />
      </div>
    </ThemeProvider>
  )
}