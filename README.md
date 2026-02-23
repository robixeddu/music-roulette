# Music Roulette 🎵

Music quiz game costruito con Next.js 15 App Router + React 19.  
Ascolta il preview di 30 secondi e indovina artista + titolo prima di perdere le 3 vite.  
<a href="https://music-roulette-seven.vercel.app/" target=_blank>music roulette</a>

## Stack

- **Next.js 15** — App Router, Server Components, Route Handlers, Turbopack
- **React 19** — hook `use()` per Promise, Suspense, Error Boundaries
- **TypeScript** strict mode
- **Deezer API** — chart pubblica per genere, niente auth necessaria
- **Jest + Testing Library** — unit e component test
- **Playwright** — test E2E

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000).

## Script disponibili

```bash
npm run dev          # dev server con Turbopack
npm run build        # build produzione
npm run start        # avvia build di produzione
npm run lint         # ESLint
npm test             # unit + component test (Jest)
npm run test:e2e     # test E2E (Playwright)
npx playwright install  # installa browser Playwright (prima volta)
```

## Struttura del progetto

```
app/
├── page.tsx                   # Homepage — RSC puro, zero JS client
├── genres/page.tsx            # Selezione genere — RSC con Suspense
├── game/page.tsx              # Game shell — RSC, legge searchParams, applica tema
├── api/
│   ├── genres/route.ts        # GET /api/genres — lista generi Deezer (cached 24h)
│   └── track/route.ts         # GET /api/track?genreId=X — domanda casuale
└── globals.css

components/
├── GameController.tsx         # Orchestratore: gameState + questionPromise
├── QuestionView.tsx           # Consuma use(questionPromise), zero loading/error logic
├── ErrorBoundary.tsx          # Catcha i rejection delle Promise passate a use()
├── GameError.tsx              # Fallback dell'ErrorBoundary
├── GameSkeleton.tsx           # Fallback del Suspense — RSC, zero JS
├── AudioPlayer.tsx            # Player accessibile (keyboard + screen reader)
├── ChoiceList.tsx             # Opzioni di risposta con feedback visivo
├── LivesIndicator.tsx         # Cuori / vite rimaste
├── Prize.tsx                  # Schermata vittoria
├── GameOver.tsx               # Schermata sconfitta
├── GenreGrid.tsx              # Griglia selezione genere
├── GenreGridSkeleton.tsx      # Skeleton griglia generi — RSC
└── ThemeProvider.tsx          # Applica tema genere come CSS custom properties

lib/
├── types.ts                   # Tipi condivisi (Deezer, game, generi, temi)
├── deezer.ts                  # Wrapper Deezer API — server only
├── game-utils.ts              # Logica di gioco — funzioni pure
└── genres.ts                  # Mappa genreId → tema visivo

__tests__/
├── lib/game-utils.test.ts
├── lib/deezer.test.ts
└── components/ChoiceList.test.tsx

e2e/
└── game.spec.ts
```

## Flusso di navigazione

```
/ (Homepage)
  └── /genres (Selezione genere — RSC fetcha lista da Deezer)
        └── /game?genreId=132&genreName=Pop (Gioco)
```

## Architettura componenti nel gioco

```
GamePage (RSC)
└── ThemeProvider (Client — inietta CSS vars del tema genere)
    └── Suspense fallback=<GameSkeleton>   ← primo render
        └── GameController (Client — gameState + questionPromise)
            ├── header (vite + punteggio) — sempre visibile
            └── ErrorBoundary fallback=<GameError>
                └── Suspense fallback=<GameSkeleton>  ← domande successive
                    └── QuestionView (Client — usa use(questionPromise))
                        ├── AudioPlayer
                        └── ChoiceList
```

## Pattern React/Next.js applicati

### Server Components + zero JS
Homepage, pagina generi e skeleton sono RSC puri.
Nessun `'use client'` = nessun JS nel bundle per quei componenti.

### Route Handlers server-side
Le chiamate a Deezer avvengono server → Deezer, mai browser → Deezer.
Niente CORS, niente API key esposta, caching granulare con `next: { revalidate }`.

### Suspense + Streaming
Next.js fa streaming dell'HTML: il browser riceve subito lo skeleton,
poi il componente viene sostituito quando la Promise si risolve.
Questo vale sia per la lista generi che per ogni domanda di gioco.

### React 19 `use()` + Promise come stato
`GameController` tiene `questionPromise` nello stato.
Quando l'utente risponde, crea una nuova Promise e la aggiorna.
`QuestionView` chiama `use(questionPromise)` — React ri-sospende
automaticamente senza `isLoading`, `isPending` o `useEffect`.

### Error Boundary
I rejection delle Promise passate a `use()` vengono catturati
dall'`ErrorBoundary`. Il retry crea una nuova Promise e resetta il boundary —
pattern pulito senza `try/catch` nei componenti.

### Tema visivo per genere
`getThemeForGenre()` calcola il tema server-side in `game/page.tsx`.
`ThemeProvider` lo inietta come CSS custom properties inline sul wrapper.
Tutto il CSS del gioco si adatta automaticamente senza duplicare regole.
