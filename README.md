# Music Roulette 🎵

Quiz musicale costruito con Next.js 15 App Router + React 19.  
Ascolta l'estratto di 30 secondi e indovina artista + titolo prima di perdere le 3 vite.

**[→ music-roulette-seven.vercel.app](https://music-roulette-seven.vercel.app/)**

## Stack

- **Next.js 15** — App Router, Server Components, Route Handlers, Turbopack
- **React 19** — hook `use()` per Promise, Suspense, Error Boundaries
- **TypeScript** strict mode
- **iTunes Search API** — preview audio 30s, nessuna auth, CORS-free
- **Jest + Testing Library** — unit e component test
- **Playwright** — test E2E

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Apri http://localhost:3000.

## Script

```bash
npm run dev        # dev server con Turbopack
npm run build      # build produzione
npm run start      # avvia build di produzione
npm run lint       # ESLint
npm test           # unit + component test (Jest)
npm run test:e2e   # test E2E (Playwright)
```

## Struttura

```
lib/
├── types.ts        # Tutti i tipi e costanti condivise
├── utils.ts        # Utilità pure (shuffleArray)
├── genres.ts       # Lista generi, temi visivi, helper
├── itunes.ts       # Fetch iTunes API + building domande
└── game-utils.ts   # Logica di gioco pura (applyGuess, getPrize…)

app/
├── page.tsx                 # Homepage — RSC puro
├── genres/page.tsx          # Selezione genere — RSC
├── game/page.tsx            # Game shell — RSC, tema, prima domanda
└── api/
    ├── genres/route.ts      # GET /api/genres
    └── track/route.ts       # GET /api/track?genreId=X

components/
├── GameController.tsx       # Stato gioco + Promise domande
├── QuestionView.tsx         # Consuma use(questionPromise)
├── AudioPlayer.tsx          # Player accessibile
├── ChoiceList.tsx           # Opzioni risposta
├── ErrorBoundary.tsx        # Catcha rejection Promise
├── GameError.tsx            # Fallback errore
├── GameSkeleton.tsx         # Fallback loading
├── GenreGrid.tsx            # Griglia selezione genere
├── LivesIndicator.tsx       # Cuori / vite
├── Prize.tsx                # Schermata vittoria
├── GameOver.tsx             # Schermata sconfitta
└── ThemeProvider.tsx        # CSS vars tema genere
```

## Architettura

```
GamePage (RSC) — fetcha prima domanda server-side
└── ThemeProvider — inietta CSS vars tema
    └── Suspense fallback=<GameSkeleton>
        └── GameController (Client)
            ├── header: vite + punteggio — sempre visibile
            └── ErrorBoundary fallback=<GameError>
                └── Suspense fallback=<GameSkeleton>
                    └── QuestionView — use(questionPromise)
                        ├── AudioPlayer
                        └── ChoiceList
```
