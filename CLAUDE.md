# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**severbus.ru** — bus schedule app for route 112С in Tomsk, Russia. React SPA frontend + Express/SQLite backend. ~2K unique users/month. Transitioning from static GitHub Pages to a full-stack app with Docker deployment.

## Commands

### Frontend (`frontend/`)
```bash
yarn dev          # Dev server with HMR (HTTPS)
yarn build        # Production build → frontend/build/
yarn lint         # ESLint
```

### Backend (`backend/`)
```bash
npm run dev       # Watch mode (tsx)
npm run build     # TypeScript → dist/
npm start         # Production
```

### Docker
```bash
docker-compose up --build   # Run backend (port 3000)
```

## Architecture

**Monorepo**: `frontend/` + `backend/` + `specs/` + `scripts/`

### Frontend — Feature-Sliced Design (FSD)
- `App/` — entry point, routing (React Router v6)
- `page/` — pages (Home, Dev, Game)
- `widget/` — complex UI blocks (Map, BusStop, TodaysBuses)
- `features/` — feature modules (DirectionChanger, Complains, FavoriteStops)
- `entities/` — basic UI entities
- `shared/` — API (RTK Query), Redux store, configs, theme, UI components

Stack: React 18, TypeScript, Vite, Redux Toolkit + RTK Query, styled-components 6, Leaflet/MapTiler (maps), i18next, PWA (workbox).

### Backend
Express + better-sqlite3. Entry point: `backend/src/index.ts`. Routes in `backend/src/routes/`.

### Data Model
Schedule shape: `direction → dayOfWeek → stopName → ["07:15", "10:25", ...]`
Directions: `inSP` (to North Park), `out` (to city), `inLB` (to Left Bank).
Days are `Date.getDay()` keys: `'0'` = Sunday … `'6'` = Saturday.

It is **not** hardcoded in the frontend anymore (that was removed in `93cc8ac`). It lives in
SQLite on the VDS and is served by `GET /api/schedule`; the frontend lazy-loads it via RTK Query
(`shared/api/scheduleApi.ts`) with a 24h localStorage cache. `backend/src/data/schedule-seed.json`
only seeds an **empty** DB — editing it does not change the live site.

Only stops the carrier actually publishes have times. Intermediate city stops (Главпочтамт, ТГУ,
ТЭМЗ, Учебная, …) are estimated at runtime by `shared/lib/time/interpolateStopTimes.ts`, which
matches trips **by array index** — so a change to trip counts can silently skew those estimates.

### Schedule source of truth
The carrier now publishes the 112С schedule as **photos**, not Word files, so the cron parser
(`specs/02-schedule-parser.md`) is disabled and the schedule is transcribed by hand.

- Photos live in `frontend/public/schedule/` and are linked from the site footer
  (`shared/ui/Footer/scheduleSource.ts`) so users can check the original.
- Transcription + upload payload: `specs/schedule-YYYY-MM-{from-images,payload}.json`.
- Push to prod: `ADMIN_TOKEN=... ./scripts/push-schedule.sh` → `POST /api/schedule/refresh-json`.
- **Full procedure, name mapping, interpolation pitfall and the list of carrier anomalies:
  `specs/13-schedule-from-images.md`. Read it before touching schedule data.**

Anomalies in the carrier's tables (impossible gaps, likely typos) are transcribed **as printed**
and recorded in the `anomalies` field — do not "fix" them.

## Deployment

- Frontend: GitHub Pages (CNAME: severbus.ru), being migrated to VDS
- Backend: Docker Compose on shared VDS with nginx reverse-proxy
- CI: GitHub Actions — lint+build on PRs, deploy on push to main
- Secrets: MAPTILER_KEY_1–11, SSH_PRIVATE_KEY, DEPLOY_HOST, DEPLOY_USER, DEPLOY_PATH

## Development Workflow

**Spec-driven**: specs first, code second. Specs live in `specs/NN-slug-name.md` (written in Russian). Template at `specs/_template.md`. Phases: Specify → Clarify → Acceptance criteria → Implement (only after user confirms).

**Structure changes**: when adding/moving files, update `context.md` (project tree, FSD layers, API table, DB schema) and `README.md` (project tree). Use Mermaid for architecture diagrams. Tests go in `__tests__/` next to tested modules.

## Key Specs (in `specs/`)
01: backend + deploy, 02: schedule parser (Word — now disabled), 03: complaints, 04: live tracking,
05: directions rework, 06: monitoring, 07: ads, 08: donations, 09: local business outreach,
10: community channels, 11: authentication, 12: yandex maps analysis,
13: schedule from photos (current way the schedule gets updated).

## Package Managers
- Frontend: **Yarn 3.4.1**
- Backend: **npm**
