import { ArtistSearch } from './ArtistSearch'

interface RetryButtonsProps {
  gameName: string
  onRestart: () => void
  onArtistSelect: (artistName: string) => void
}

export function RetryButtons({ gameName, onRestart, onArtistSelect }: RetryButtonsProps) {
  return (
    <>
      <button
        type="button"
        className="btn btn--primary btn--large"
        onClick={onRestart}
        autoFocus
      >
        Gioca ancora con {gameName}
      </button>
      <div className="home__divider" aria-hidden="true">oppure</div>
      <ArtistSearch onSelect={onArtistSelect} />
    </>
  )
}
