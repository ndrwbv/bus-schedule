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

## Восстановление карты 4 ноября 2026

- `frontend/src/widget/Map/mapLoading.ts` и `__tests__/mapLoading.test.ts`: загрузка карты с резервным источником; остановки доступны после загрузки стиля.
- `frontend/vitest.config.ts`: тесты карты, запуск `cd frontend && yarn test`.
- Проверка состояния контейнера и deploy использует публичный `/api/schedule`.
- Объявление и отдельные ноябрьские таблицы отменены по запросу владельца. Прежний интерфейс расписания восстановлен; данные SQLite не менялись.

## Расписание с 7 ноября в прежних карточках

- `backend/src/data/schedule-2026-11.json`: четыре таблицы перевозчика и `effectiveFrom`. `/api/schedule` добавляет их в `schedule.circuits`; прежняя SQLite не перезаписывается. ETag включает обе модели.
- `frontend/src/shared/store/schedule/circuitTrips.ts`: адаптер круговых рейсов для существующих списков и карточки рейса. Ссылка на рейс — `tripId` (таблица:столбец), `direction`, `serviceDate`, `visitIndex` для повторных остановок.
- `frontend/src/shared/store/schedule/serviceDate.ts`: даты Asia/Tomsk, граница версии и календарь дней/праздников. Открытая страница проверяет смену дня каждые 30 секунд.
- `frontend/src/shared/store/busStop/const/novemberStops.ts`: дополнительные остановки/направления без изменения прежних id и избранных.
- `frontend/src/shared/store/schedule/__tests__/november.test.ts`: смена версии, будущая дата, оба плеча, все опубликованные времена, сокращённые рейсы и повторы.
- Прежние Home, стили, карточки и список времени сохранены. В существующем выборе дня добавлены `Будни с 7.11` / `Выходные с 7.11` до перехода; после перехода используются обычные пункты.
- Источник и ограничения: `specs/17-november-in-existing-ui.md`. Новые таблицы не отображаются отдельным экраном.
