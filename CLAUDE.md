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
Schedule is a hardcoded TypeScript constant in `frontend/src/shared/common/schedule.ts`:
`direction → dayOfWeek → stopName → ["8:15", "10:25", ...]`
Directions: `inSP` (to North Park), `out` (to city), `inLB` (to Left Bank).

## Deployment

- Frontend: GitHub Pages (CNAME: severbus.ru), being migrated to VDS
- Backend: Docker Compose on shared VDS with nginx reverse-proxy
- CI: GitHub Actions — lint+build on PRs, deploy on push to main
- Secrets: MAPTILER_KEY_1–11, SSH_PRIVATE_KEY, DEPLOY_HOST, DEPLOY_USER, DEPLOY_PATH

## Development Workflow

**Spec-driven**: specs first, code second. Specs live in `specs/NN-slug-name.md` (written in Russian). Template at `specs/_template.md`. Phases: Specify → Clarify → Acceptance criteria → Implement (only after user confirms).

**Structure changes**: when adding/moving files, update `context.md` (project tree, FSD layers, API table, DB schema) and `README.md` (project tree). Use Mermaid for architecture diagrams. Tests go in `__tests__/` next to tested modules.

## Key Specs (in `specs/`)
01: backend + deploy, 02: schedule parser, 03: complaints, 04: live tracking, 05: directions rework, 06: monitoring, 07: ads, 08: donations, 09: local business outreach, 10: community channels.

## Package Managers
- Frontend: **Yarn 3.4.1**
- Backend: **npm**
