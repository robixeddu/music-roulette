'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { ArtistResult } from '@/lib/types'
import { useLocale } from '@/hooks/useLocale'
import styles from './ArtistSearch.module.css'

interface ArtistSearchProps {
  onSelect?: (artistName: string) => void
}

export function ArtistSearch({ onSelect }: ArtistSearchProps) {
  const { t } = useLocale()
  const router = useRouter()
  const [query, setQuery]           = useState('')
  const [results, setResults]       = useState<ArtistResult[]>([])
  const [isLoading, setIsLoading]   = useState(false)
  const [isOpen, setIsOpen]         = useState(false)
  const [dropdownDir, setDropdownDir] = useState<'sheet' | 'up' | 'down'>('down')

  const debounceRef   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wrapperRef    = useRef<HTMLDivElement>(null)
  const inputRef      = useRef<HTMLInputElement>(null)
  const sheetInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (dropdownDir === 'sheet') return
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node))
        setIsOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [dropdownDir])

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setIsOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (isOpen && dropdownDir === 'sheet')
      setTimeout(() => sheetInputRef.current?.focus(), 80)
  }, [isOpen, dropdownDir])

  const calcDirection = useCallback(() => {
    const isMobile = window.matchMedia('(max-width: 768px)').matches
    if (isMobile) return 'sheet' as const
    const rect = wrapperRef.current?.getBoundingClientRect()
    if (!rect) return 'down' as const
    const estimatedHeight = Math.min(results.length, 6) * 52 + 8
    const spaceBelow = window.innerHeight - rect.bottom
    return spaceBelow >= estimatedHeight || spaceBelow >= rect.top ? 'down' as const : 'up' as const
  }, [results.length])

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); setIsOpen(false); return }
    setIsLoading(true)
    try {
      const res = await fetch(`/api/artists?q=${encodeURIComponent(q)}`)
      const data: ArtistResult[] = await res.json()
      setResults(data)
      if (data.length > 0) { setDropdownDir(calcDirection()); setIsOpen(true) }
      else setIsOpen(false)
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

  const handleFocus = () => {
    if (results.length > 0) { setDropdownDir(calcDirection()); setIsOpen(true) }
  }

  const commit = useCallback((artist: ArtistResult) => {
    setQuery(artist.artistName)
    setIsOpen(false)
    if (onSelect) onSelect(artist.artistName)
    else router.push(`/game?artistName=${encodeURIComponent(artist.artistName)}`)
  }, [onSelect, router])

  const resultsList = (
    <ul
      id="artist-suggestions"
      className={styles.sheetList}
      role="listbox"
      aria-label={t('aria.artist.suggestions')}
    >
      {results.map(artist => (
        <li
          key={artist.artistId}
          role="option"
          aria-selected="false"
          className={styles.option}
          onClick={() => commit(artist)}
          onKeyDown={e => e.key === 'Enter' && commit(artist)}
          tabIndex={0}
        >
          <span className={styles.optionName}>{artist.artistName}</span>
          {artist.primaryGenreName && (
            <span className={styles.optionGenre}>{artist.primaryGenreName}</span>
          )}
        </li>
      ))}
    </ul>
  )

  return (
    <div className={styles.search} ref={wrapperRef}>
      <div className={styles.inputWrap}>
        <input
          ref={inputRef}
          type="text"
          className={styles.input}
          placeholder={t('search.placeholder')}
          value={query}
          onChange={handleChange}
          onFocus={handleFocus}
          onKeyDown={e => e.key === 'Escape' && setIsOpen(false)}
          aria-label={t('search.placeholder').replace('...', '')}
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls="artist-suggestions"
          autoComplete="off"
          style={{ fontSize: '16px' }}
        />
        {isLoading && <span className={styles.spinner} aria-hidden="true">⏳</span>}
      </div>

      {/* Desktop: tendina smart flip */}
      {isOpen && dropdownDir !== 'sheet' && (
        <div className={`${styles.dropdown} ${dropdownDir === 'up' ? styles.dropdownUp : ''}`}>
          {resultsList}
        </div>
      )}

      {/* Mobile: bottom sheet */}
      {isOpen && dropdownDir === 'sheet' && (
        <>
          <div className={styles.overlay} aria-hidden="true" onClick={() => setIsOpen(false)} />
          <div className={styles.sheet} role="dialog" aria-modal="true" aria-label={t('search.placeholder').replace('...', '')}>
            <div className={styles.sheetHandle} aria-hidden="true" />
            <div className={styles.sheetInputWrap}>
              <input
                ref={sheetInputRef}
                type="text"
                className={`${styles.input} ${styles.sheetInput}`}
                placeholder={t('search.placeholder')}
                value={query}
                onChange={handleChange}
                onKeyDown={e => e.key === 'Escape' && setIsOpen(false)}
                aria-label={t('search.placeholder').replace('...', '')}
                autoComplete="off"
                style={{ fontSize: '16px' }}
              />
              <button
                type="button"
                className={styles.sheetClose}
                onClick={() => setIsOpen(false)}
                aria-label={t('aria.search.close')}
              >✕</button>
            </div>
            {results.length > 0
              ? resultsList
              : <p className={styles.sheetEmpty}>{isLoading ? '…' : t('search.notfound', { q: '' }).replace(' "{q}"', '')}</p>
            }
          </div>
        </>
      )}
    </div>
  )
}