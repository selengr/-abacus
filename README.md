# Soroban Arena

Timed digital soroban with a public leaderboard, sound, and 1v1 race rooms.

**Suggested GitHub repo name:** `soroban-arena`

## Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- TypeScript

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3010](http://localhost:3010).

> Note: this app uses **port 3010** so it does not collide with other local apps on 3000.

## Play

- Landing: `/`
- Solo arena: `/play`
- Daily challenge: `/play/daily`
- Practice: `/play/practice`
- 1v1 race: `/play/race`
- Public scores API: `GET/POST /api/scores`

## Features

- **Daily challenge** — one seeded board for everyone each UTC day
- **Practice mode** — untimed warm-ups
- **Achievements** — unlock badges for streaks, scores, and daily clears
- **Keyboard controls** — arrow keys select a rod; `0-4` set earth beads; `H`/`5` toggle heaven
- **Combo toasts** — floating score feedback on each solve
- **Share results** — copy or native-share your run
- **Race countdown** — shared 3-2-1 freeze before beads unlock
- **Installable PWA manifest** — add to home screen friendly
- **Public leaderboard** — scores post through the API (file/memory locally, Upstash Redis in production if configured)
- **Sound** — bead clicks, success, timer ticks, mute toggle
- **Multiplayer race** — create/join a room code or invite link, same seeded problems, live rival score

## Optional Upstash

Copy `.env.example` to `.env.local` and set:

```bash
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

Without Redis, local/dev still works via `.data/store.json`.

## Scripts

```bash
npm run dev
npm run build
npm start
npm run lint
```
