# Music Roulette 🎵

Music quiz game costruito con Next.js 15 App Router + React 19.  
Ascolta il preview di 30 secondi e indovina artista + titolo prima di perdere le 3 vite.

## Stack

- **Next.js 15** (App Router, Server Components, Route Handlers, Turbopack)
- **React 19** (hook `use()` per Promise nei Client Components)
- **TypeScript** strict mode
- **Deezer API** – chart pubblica, niente auth necessaria
- **Jest + Testing Library** per unit/component test
- **Playwright** per E2E

## Setup

```bash
# 1. Installa le dipendenze
npm install

# 2. Copia le env vars (già configurate per localhost)
cp .env.example .env.local

# 3. Avvia il dev server (Turbopack abilitato di default)
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000).

## Test

```bash
# Unit + component tests
npm test

# E2E (richiede il dev server in esecuzione)
npm run test:e2e

# Installa i browser Playwright (prima volta)
npx playwright install
```

## Struttura

```
app/
├── page.tsx              # Homepage — RSC puro, zero JS client
├── game/page.tsx         # Game shell — RSC con Suspense + Promise non-awaited
├── api/track/route.ts    # Route Handler — fetch Deezer server-side
└── globals.css

components/
├── GameBoard.tsx         # Logica di gioco — usa React 19 use() hook
├── AudioPlayer.tsx       # Player accessibile (keyboard + screen reader)
├── ChoiceList.tsx        # Opzioni di risposta
├── LivesIndicator.tsx    # Cuori / vite
├── Prize.tsx             # Schermata vittoria
├── GameOver.tsx          # Schermata sconfitta
└── GameSkeleton.tsx      # Skeleton per Suspense fallback — RSC

lib/
├── types.ts              # Tipi condivisi
├── deezer.ts             # Wrapper Deezer API (server-only)
└── game-utils.ts         # Logica di gioco — funzioni pure

__tests__/
├── lib/game-utils.test.ts
├── lib/deezer.test.ts
└── components/ChoiceList.test.tsx

e2e/
└── game.spec.ts          # Flusso completo Playwright
```
