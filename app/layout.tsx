import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Music Roulette',
  description: 'Indovina la canzone prima di perdere tutte le vite.',
  openGraph: {
    title: 'Music Roulette',
    description: 'Indovina la canzone prima di perdere tutte le vite.',
    type: 'website',
  },
}

/**
 * Root Layout — RSC puro.
 * Nessun 'use client': zero JS extra nel bundle per questo componente.
 * Definisce la struttura HTML base e i meta tag.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body suppressHydrationWarning>
        {/* skip-link per accessibilità keyboard: permette di saltare la nav */}
        <a href="#main-content" className="skip-link">
          Vai al contenuto principale
        </a>
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
      </body>
    </html>
  )
}
