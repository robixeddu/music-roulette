'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { ArtistResult } from '@/lib/types'

interface ArtistSearchProps {
  onSelect?: (artistName: string) => void
}

export function ArtistSearch({ onSelect }: ArtistSearchProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ArtistResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([])
      setIsOpen(false)
      return
    }
    setIsLoading(true)
    try {
      const res = await fetch(`/api/artists?q=${encodeURIComponent(q)}`)
      const data: ArtistResult[] = await res.json()
      setResults(data)
      setIsOpen(data.length > 0)
    } catch {
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(val), 300)
  }

  const handleOptionSelect = (artist: ArtistResult) => {
    setIsOpen(false)
    if (onSelect) {
      onSelect(artist.artistName)
    } else {
      router.push(`/game?artistName=${encodeURIComponent(artist.artistName)}`)
    }
  }

  return (
    <div className="artist-search" ref={wrapperRef}>
      <div className="artist-search__input-wrap">
        <input
          type="text"
          className="artist-search__input"
          placeholder="Cerca un artista..."
          value={query}
          onChange={handleChange}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          onKeyDown={e => e.key === 'Escape' && setIsOpen(false)}
          aria-label="Cerca un artista"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls="artist-suggestions"
          autoComplete="off"
        />
        {isLoading && (
          <span className="artist-search__spinner" aria-hidden="true">⏳</span>
        )}
      </div>

      {isOpen && (
        <ul
          id="artist-suggestions"
          className="artist-search__dropdown"
          role="listbox"
          aria-label="Suggerimenti artisti"
        >
          {results.map(artist => (
            <li
              key={artist.artistId}
              role="option"
              aria-selected="false"
              className="artist-search__option"
              onClick={() => handleOptionSelect(artist)}
              onKeyDown={e => e.key === 'Enter' && handleOptionSelect(artist)}
              tabIndex={0}
            >
              <span className="artist-search__option-name">{artist.artistName}</span>
              {artist.primaryGenreName && (
                <span className="artist-search__option-genre">{artist.primaryGenreName}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
