# severbus.ru

Сайт с расписанием автобуса 112С для района Северный парк (Томск).

## Структура проекта

```
/
├── frontend/              ← React SPA (Vite + TypeScript)
│   ├── src/
│   │   ├── App/           — точка входа, роутинг
│   │   ├── page/          — страницы (Home, Dev, Game)
│   │   ├── widget/        — составные UI-блоки (Map, BusStop, TodaysBuses)
│   │   ├── features/      — функциональные модули
│   │   ├── entities/      — базовые UI-сущности
│   │   └── shared/        — api, common, configs, lib, store, theme, ui
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── .env.example
├── backend/               ← Express + SQLite
│   ├── src/
│   │   ├── index.ts       — точка входа
│   │   ├── routes/        — роуты (health)
│   │   └── services/      — сервисы (db)
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   └── .env.example
├── docker-compose.yml     ← backend + shared-proxy network
├── scripts/
│   └── deploy.sh          — ручной деплой
├── specs/                 ← спецификации фич
├── .github/workflows/     ← CI/CD
│   ├── ci.yml             — lint + build на PR
│   └── deploy.yml         — деплой на push в main
├── .env.example           ← переменные для деплоя
├── context.md
└── README.md
```

## Быстрый старт

### Frontend

```bash
cd frontend
yarn install
yarn dev
```

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Docker (production)

```bash
docker-compose up -d --build
```

## Деплой

CI/CD: push в `main` → GitHub Actions собирает фронтенд, rsync на сервер, `docker-compose up -d --build`.

Ручной деплой: `./scripts/deploy.sh` (требует `.env` в корне проекта).

## Люди

- [Степа Тугарев](https://github.com/Atlantis3221)
- [Евгений Еремин](https://github.com/EE78)
- [Игорь Первушин](https://github.com/kapshn)
- [Андрей Боев](https://github.com/ndrwbv)
