'use client'

import { useState, useEffect } from 'react'
import {
  type Locale,
  type TranslationKey,
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  TRANSLATIONS,
} from '@/lib/i18n'

function detectLocale(): Locale {
  if (typeof navigator === 'undefined') return DEFAULT_LOCALE
  const base = (navigator.language ?? '').toLowerCase().split('-')[0] as Locale
  return SUPPORTED_LOCALES.includes(base) ? base : DEFAULT_LOCALE
}

export function useLocale() {
  // Inizia sempre con il default (italiano) — uguale su server e primo render client
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE)

  // Dopo il mount rileva la lingua reale del browser — nessun mismatch
  useEffect(() => {
    setLocale(detectLocale())
  }, [])

  function t(key: TranslationKey, vars?: Record<string, string | number>): string {
    const dict = TRANSLATIONS[locale] as Record<string, string>
    const fallback = TRANSLATIONS[DEFAULT_LOCALE] as Record<string, string>
    let str = dict[key] ?? fallback[key] ?? key
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        str = str.replace(`{${k}}`, String(v))
      }
    }
    return str
  }

  return { locale, t }
}