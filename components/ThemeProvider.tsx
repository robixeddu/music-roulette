'use client'

import type { GenreTheme } from '@/lib/types'
import { themeToCSSVars } from '@/lib/genres'
import styles from './ThemeProvider.module.css'

interface ThemeProviderProps {
  theme: GenreTheme
  children: React.ReactNode
}

export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  return (
    <div className={styles.provider} style={themeToCSSVars(theme)}>
      {children}
    </div>
  )
}
