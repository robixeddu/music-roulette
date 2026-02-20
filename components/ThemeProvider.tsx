'use client'

import type { GenreTheme } from '@/lib/types'
import { themeToCSSVars } from '@/lib/genres'

interface ThemeProviderProps {
  theme: GenreTheme
  children: React.ReactNode
}

/**
 * Applica il tema del genere come CSS custom properties inline.
 * Sovrascrive le variabili definite in globals.css solo per il
 * sottoalbero che wrappa, non per tutta la pagina.
 *
 * Essendo un Client Component molto leggero (nessuno stato, nessun
 * effetto), il suo unico compito è propagare le CSS vars ai figli.
 */
export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  return (
    <div className="theme-provider" style={themeToCSSVars(theme)}>
      {children}
    </div>
  )
}
