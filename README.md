# Soroban — Abacus Arena

Timed digital soroban with a public leaderboard, sound, and 1v1 race rooms.

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

Open [http://localhost:3000](http://localhost:3000).

## Play

- Landing: `/`
- Solo arena: `/play`
- 1v1 race: `/play/race`
- Public scores API: `GET/POST /api/scores`

## Features

- **Public leaderboard** — scores post through the API (file/memory locally, Upstash Redis in production if configured)
- **Sound** — bead clicks, success, timer ticks, mute toggle
- **Multiplayer race** — create/join a room code, same seeded problems, live rival score

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
