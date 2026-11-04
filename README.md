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
│   │   └── schedule/      — фото расписания от перевозчика (первоисточник)
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── .env.example
├── backend/               ← Express + SQLite
│   ├── src/
│   │   ├── index.ts       — точка входа
│   │   ├── routes/        — роуты (health)
│   │   ├── data/          — schedule-seed.json (сид для пустой БД), route-112s.json (линия маршрута)
│   │   └── services/      — сервисы (db, live/ — трекер и направление live-автобусов)
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   └── .env.example
├── docker-compose.yml     ← backend + shared-proxy network
├── scripts/
│   ├── build-route-112s.mjs — линия маршрута из OSM/OSRM для направления live
│   ├── deploy.sh          — ручной деплой
│   └── push-schedule.sh   — заливка расписания JSON'ом в прод
├── specs/                 ← спецификации фич + JSON расписания
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

## Изменения 7 ноября 2026

- `frontend/src/features/RouteSchedule/`: локальные таблицы перевозчика, описание двух путей, фильтры дня и остановки. `timetable.json` сохраняет столбцы рейсов, повторные остановки и пропуски.
- `specs/16-map-and-november-route.md`: требования и результаты проверки.
- Новые таблицы доступны заранее и раскрываются по умолчанию с 2026-11-07 00:00 Asia/Tomsk. Объявление явно ограничивает срок старых списков 6 ноября. Миграция SQLite и основного интерфейса на новую модель рейсов ещё требуется.
- Карта сначала запрашивает `/tiles/style.json`, через 15 секунд при отсутствии полной загрузки пробует OpenFreeMap. Слои остановок доступны после загрузки стиля, обработчики автобусов очищаются при повторе.
- `frontend/src/widget/Map/mapLoading.ts` и `__tests__/mapLoading.test.ts`: управление загрузкой карты и проверка переключения провайдера.

Тесты фронтенда: `cd frontend && yarn test`; отдельный `vitest.config.ts`
проверяет загрузку карты и структуру ноябрьских таблиц без запуска PWA.
