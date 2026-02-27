import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import styles from './layout.module.css'

export const metadata: Metadata = {
  title: 'Music Roulette',
  description: 'Indovina la canzone prima di perdere tutte le vite.',
  openGraph: {
    title: 'Music Roulette',
    description: 'Indovina la canzone prima di perdere tutte le vite.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body suppressHydrationWarning>
        <a href="#main-content" className={styles.skipLink}>
          Vai al contenuto principale
        </a>
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}
