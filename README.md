# Music Roulette 🎵

A music quiz built with Next.js 15 App Router + React 19.  
Listen to the 30-second preview and guess the artist + title before losing all 3 lives.

**[→ music-roulette-seven.vercel.app](https://music-roulette-seven.vercel.app/)**

---

## Stack

- **Next.js 15** — App Router, Server Components, Route Handlers, Turbopack
- **React 19** — `use()` hook for Promises, Suspense, Error Boundaries
- **TypeScript** strict mode
- **iTunes Search API** — 30s audio previews, no auth required, CORS-free
- **Neon Postgres** — persistent top 50 leaderboard
- **Jest + Testing Library** — unit and component tests
- **Playwright** — E2E tests

---

## Setup

```bash
npm install
cp .env.example .env.local
# Set POSTGRES_URL in .env.local (Neon dev branch)
npm run dev
```

Open http://localhost:3000.

---

## Scripts

```bash
npm run dev        # dev server with Turbopack
npm run build      # production build
npm run start      # start production build
npm run lint       # ESLint
npm test           # unit + component tests (Jest)
npm run test:e2e   # E2E tests (Playwright)
```

---

## How to play

1. Choose a **music genre** or search for a **specific artist**
2. Listen to the 30-second preview
3. Guess the artist and title from 4 options
4. You have **3 lives** — each mistake costs one
5. Complete the level and climb to **Master** to enter the leaderboard

**4 difficulty levels:** Rookie → Arcade → Expert → Master (×5 multiplier)

---

## Project structure

```
app/
├── page.tsx                 Homepage
├── genres/page.tsx          Genre selection
├── game/page.tsx            Game (RSC async, first question server-side)
├── leaderboard/page.tsx     Hall of Fame — top 50, tabs: Global / Genres / Artists
└── api/
    ├── artists/route.ts     Artist autocomplete
    ├── track/route.ts       Question fetch
    └── leaderboard/route.ts GET top50 + eligibility check, POST score

components/
├── GameController.tsx       Game state orchestrator
├── QuestionView.tsx         Question + player + choices
├── AudioPlayer.tsx          Accessible player with autoplay
├── ChoiceList.tsx           4 answer options
├── GenreGrid.tsx            Genre selection grid (25 genres, grouped)
├── GameOver.tsx             End-of-game screen + leaderboard modal
├── Prize.tsx                Level completion screen
└── ...

lib/
├── i18n.ts                  Translations: it · en · es · fr · de
├── genres.ts                25 genres with neon color themes
├── levels.ts                Level config and scoring
└── ...

hooks/
└── useLocale.ts             Browser language detection
```

---

## Internationalisation

The UI adapts automatically to the browser language.  
Supported languages: 🇮🇹 Italian · 🇬🇧 English · 🇪🇸 Spanish · 🇫🇷 French · 🇩🇪 German

Genre names and level names remain unchanged across all languages.

---

## Leaderboard

Scores are calculated by combining:
- **Correct answers** × **level multiplier**
- **Speed multiplier** — answering faster scores more (from ×3.0 down to ×0.5)

The leaderboard is split into three views: **Global**, **by Genre**, **by Artist**.