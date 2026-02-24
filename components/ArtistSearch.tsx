'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { ArtistResult } from '@/lib/types'

interface ArtistSearchProps {
  onSelect?: (artistName: string) => void
}

/**
 * Su mobile (≤768px) apre un bottom sheet con overlay.
 * Su desktop calcola se c'è più spazio sopra o sotto l'input
 * e apre la tendina nella direzione con più spazio.
 */
export function ArtistSearch({ onSelect }: ArtistSearchProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ArtistResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  // 'sheet' = mobile bottom sheet | 'up' | 'down' = desktop flip
  const [dropdownDir, setDropdownDir] = useState<'sheet' | 'up' | 'down'>('down')

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const sheetInputRef = useRef<HTMLInputElement>(null)

  // Chiudi al click esterno (solo desktop)
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (dropdownDir === 'sheet') return
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [dropdownDir])

  // Chiudi con Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  // Focus sull'input del sheet quando si apre
  useEffect(() => {
    if (isOpen && dropdownDir === 'sheet') {
      setTimeout(() => sheetInputRef.current?.focus(), 80)
    }
  }, [isOpen, dropdownDir])

  const calcDirection = useCallback(() => {
    const isMobile = window.matchMedia('(max-width: 768px)').matches
    if (isMobile) return 'sheet' as const

    const rect = wrapperRef.current?.getBoundingClientRect()
    if (!rect) return 'down' as const
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top
    // Stima altezza tendina: 6 risultati × ~52px = ~312px
    const estimatedHeight = Math.min(results.length, 6) * 52 + 8
    return spaceBelow >= estimatedHeight || spaceBelow >= spaceAbove ? 'down' as const : 'up' as const
  }, [results.length])

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
      if (data.length > 0) {
        setDropdownDir(calcDirection())
        setIsOpen(true)
      } else {
        setIsOpen(false)
      }
    } catch {
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [calcDirection])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(val), 300)
  }

  // Stessa logica per l'input dentro il sheet
  const handleSheetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(val), 300)
  }

  const handleFocus = () => {
    if (results.length > 0) {
      setDropdownDir(calcDirection())
      setIsOpen(true)
    }
  }

  const commit = useCallback((artist: ArtistResult) => {
    setQuery(artist.artistName)
    setIsOpen(false)
    if (onSelect) {
      onSelect(artist.artistName)
    } else {
      router.push(`/game?artistName=${encodeURIComponent(artist.artistName)}`)
    }
  }, [onSelect, router])

  const resultsList = (
    <ul
      id="artist-suggestions"
      className="artist-search__list"
      role="listbox"
      aria-label="Suggerimenti artisti"
    >
      {results.map(artist => (
        <li
          key={artist.artistId}
          role="option"
          aria-selected="false"
          className="artist-search__option"
          onClick={() => commit(artist)}
          onKeyDown={e => e.key === 'Enter' && commit(artist)}
          tabIndex={0}
        >
          <span className="artist-search__option-name">{artist.artistName}</span>
          {artist.primaryGenreName && (
            <span className="artist-search__option-genre">{artist.primaryGenreName}</span>
          )}
        </li>
      ))}
    </ul>
  )

  return (
    <div className="artist-search" ref={wrapperRef}>
      {/* Input principale */}
      <div className="artist-search__input-wrap">
        <input
          ref={inputRef}
          type="text"
          className="artist-search__input"
          placeholder="Cerca un artista..."
          value={query}
          onChange={handleChange}
          onFocus={handleFocus}
          onKeyDown={e => e.key === 'Escape' && setIsOpen(false)}
          aria-label="Cerca un artista"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls="artist-suggestions"
          autoComplete="off"
          style={{ fontSize: '16px' }}
        />
        {isLoading && (
          <span className="artist-search__spinner" aria-hidden="true">⏳</span>
        )}
      </div>

      {/* ── Desktop: tendina smart flip ──────────────────────────────── */}
      {isOpen && dropdownDir !== 'sheet' && (
        <div className={`artist-search__dropdown artist-search__dropdown--${dropdownDir}`}>
          {resultsList}
        </div>
      )}

      {/* ── Mobile: bottom sheet ─────────────────────────────────────── */}
      {isOpen && dropdownDir === 'sheet' && (
        <>
          {/* Overlay scuro */}
          <div
            className="artist-search__overlay"
            aria-hidden="true"
            onClick={() => setIsOpen(false)}
          />

          {/* Sheet */}
          <div
            className="artist-search__sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Cerca un artista"
          >
            {/* Handle drag visivo */}
            <div className="artist-search__sheet-handle" aria-hidden="true" />

            {/* Input ripetuto dentro lo sheet — visibile sopra la tastiera */}
            <div className="artist-search__sheet-input-wrap">
              <input
                ref={sheetInputRef}
                type="text"
                className="artist-search__input artist-search__sheet-input"
                placeholder="Cerca un artista..."
                value={query}
                onChange={handleSheetChange}
                onKeyDown={e => e.key === 'Escape' && setIsOpen(false)}
                aria-label="Cerca un artista"
                autoComplete="off"
                style={{ fontSize: '16px' }}
              />
              <button
                type="button"
                className="artist-search__sheet-close"
                onClick={() => setIsOpen(false)}
                aria-label="Chiudi"
              >
                ✕
              </button>
            </div>

            {results.length > 0 ? resultsList : (
              <p className="artist-search__sheet-empty">
                {isLoading ? 'Ricerca in corso…' : 'Nessun risultato'}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
