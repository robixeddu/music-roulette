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

1. Choose one of **41 music genres** or search for a **specific artist**
2. Listen to the 30-second preview — it autoplays
3. Guess the artist and title from 4 options
4. You have **3 lives** — each mistake costs one
5. Complete all 4 levels to enter the leaderboard

**4 difficulty levels:** Rookie → Arcade → Expert → Master (×5 multiplier)

---

## Scoring

Each correct answer scores points based on three multipliers:

```
points = levelMultiplier × timeMultiplier × streakMultiplier
```

**Time multiplier** — continuous linear curve, faster = more:

```
max(0.5, 3.0 − (seconds / 30) × 2.5)
0s → ×3.00  ·  10s → ×2.17  ·  20s → ×1.33  ·  30s+ → ×0.50
```

**Streak multiplier** — consecutive correct answers:

| Streak | Multiplier |
|--------|-----------|
| 1–2 | ×1.0 |
| 3–4 | ×1.5 |
| 5–6 | ×2.0 |
| 7+ | ×2.5 |

**Lives bonus** — on level completion: `livesLeft × 10 × levelMultiplier`

**Session score** accumulates across all 4 levels. Two players reaching Master with the same answer count but different streaks can score 60–150% apart.

---

## Genres (41)

| Group | Genres |
|-------|--------|
| Pop | Pop, Brit Pop, K-Pop, Indie Pop |
| Rock | Rock, Grunge, Psychedelic Rock, Noise Rock, Alternative, Hard Rock, Stoner Rock, Post Rock |
| Metal | Metal, Thrash Metal, Death Metal, Black Metal |
| Hip-Hop | Rap, Hip-Hop |
| Electronic | Electronic, Electro / Ambient |
| Jazz | Jazz |
| Soul | R&B, Funk & Soul, Disco, Motown, Gospel & Soul, Afrobeat, Latin |
| Blues | Blues |
| Folk | Folk, Country |
| Punk | Punk, Hardcore, Post-Hardcore, Emo, Post-Punk, New Wave |
| Reggae | Reggae, Dub, Ska |
| Classical | Classical |

Each genre has 30 hand-curated artists verified for iTunes preview availability.

---

## Project structure

```
app/
├── page.tsx                 Homepage
├── genres/page.tsx          Genre selection (41 genres, grouped)
├── game/page.tsx            Game (RSC async, first question server-side)
├── leaderboard/page.tsx     Hall of Fame — top 50, tabs: Global / Genres / Artists
└── api/
    ├── artists/route.ts     Artist autocomplete → iTunes musicArtist search
    ├── track/route.ts       Question fetch (deduplicates by track id and artist)
    └── leaderboard/route.ts GET top50 + eligibility check, POST score

components/
├── GameController.tsx       Game state, prefetch, streak display, session score
├── QuestionView.tsx         Question + player + choices (stops audio on answer)
├── AudioPlayer.tsx          Accessible player with autoplay and stopSignal
├── ChoiceList.tsx           4 answer options with CSS feedback states
├── GenreGrid.tsx            Genre selection grid (41 genres, grouped by category)
├── GameOver.tsx             End-of-game screen + leaderboard modal
├── Prize.tsx                Level completion screen
└── ...

lib/
├── i18n.ts                  Translations: it · en · es · fr · de (~72 keys)
├── genres.ts                41 genres with iTunes-first artist lists and neon color themes
├── levels.ts                Level config, time/streak/lives bonus scoring
├── game-utils.ts            applyGuess (streak + sessionScore), getPrize (returns i18n key)
├── itunes.ts                Track fetching, NFKD normalization, artist deduplication
└── ...

hooks/
└── useLocale.ts             Browser language detection (post-mount, no hydration issues)
```

---

## Internationalisation

The UI adapts automatically to the browser language.  
Supported: 🇮🇹 Italian · 🇬🇧 English · 🇪🇸 Spanish · 🇫🇷 French · 🇩🇪 German

Genre and level names are not translated.  
All UI strings go through `t()` from `useLocale` — no hardcoded strings in components.

---

## Leaderboard

Scores split into three views: **Global**, **by Genre**, **by Artist**.  
Detection is client-side: entries where `genre` matches a known genre id/name go to Genres, everything else (artist names) goes to Artists.

Top 30 only. Server re-verifies eligibility before INSERT to prevent race conditions.