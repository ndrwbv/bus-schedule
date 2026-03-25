# severbus.ru — Контекст проекта

## Что это

Сайт с расписанием автобусов для района Северный парк (Томск). Показывает «следующий автобус через N минут» вместо таблицы. Есть жалобы (автобус задержался / не пришёл). PWA — можно вынести на главный экран как приложение.

**Домен:** severbus.ru (сейчас привязан к GitHub Pages)
**Аудитория:** ~2К уников/мес, ~5К визитов/неделю (на пике)

## Текущая архитектура

### Фронтенд (всё что есть сейчас)

- **Стек:** React 18 + TypeScript, Vite 4, styled-components 6
- **Роутинг:** react-router-dom v6 (BrowserRouter)
- **Стейт:** Redux Toolkit + RTK Query
- **Карты:** Leaflet + MapTiler SDK
- **i18n:** i18next (направления и лейблы)
- **PWA:** vite-plugin-pwa (workbox)
- **Аналитика:** Google Analytics (react-ga) + Яндекс Метрика (react-yandex-metrika)

### Структура проекта

```
/
├── frontend/              ← React SPA (Feature-Sliced Design)
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
│   ├── index.html
│   └── .env.example
├── backend/               ← Express + SQLite (планируется)
│   ├── src/
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
├── docker-compose.yml
├── nginx/
├── scripts/
├── specs/
├── .github/workflows/
├── context.md
├── .env.example
└── README.md
```

**Frontend — Feature-Sliced Design (внутри `frontend/src/`):**

```
src/
├── App/           — точка входа, роутинг (index.html, App.tsx)
├── page/          — страницы
│   ├── Home/      — главная (карта + bottom sheet с расписанием)
│   ├── Dev/       — дев-страница с расписанием
│   └── Game/      — мини-игра (пасхалка)
├── widget/        — составные UI-блоки
│   ├── Map/       — карта с остановками (Leaflet/MapTiler)
│   ├── BusStop/   — выбор остановки + URL-синхронизация
│   ├── TodaysBuses/ — автобусы на сегодня
│   └── BottomSheetHeader/
├── features/      — функциональные модули
│   ├── DirectionChanger/  — переключение в СП / в город / в ЛБ
│   ├── Complains/         — жалобы (GraphQL → popooga.ru)
│   ├── HowMuchLeft/       — «через сколько автобус»
│   ├── NearestStops/      — ближайшие остановки
│   ├── FavoriteStops/     — избранные остановки
│   ├── StripAd/           — рекламный баннер
│   ├── FAQ/
│   ├── MyLocation/
│   ├── BottomSheet/
│   ├── Info/              — RTK Query для инфо-блока
│   ├── LeaveFeedbackButton/
│   └── OtherTimeBuses/
├── entities/      — базовые UI-сущности
│   ├── Logo/
│   ├── WriteMe/
│   ├── SelectBusStopText/
│   └── Holiday/
└── shared/
    ├── api/       — Contentful API (расписание, инфо)
    ├── common/    — schedule.ts (ГЛАВНЫЙ ФАЙЛ С РАСПИСАНИЕМ)
    ├── configs/   — base.ts (токены Contentful, MapTiler)
    ├── lib/       — утилиты (время, аналитика, запросы, redux хелперы)
    ├── store/     — Redux slices
    │   ├── schedule/     — scheduleSlice + ISchedule
    │   ├── busStop/      — busStopInfoSlice + направления/остановки
    │   ├── timeLeft/     — расчёт «через сколько»
    │   ├── holidays/     — праздники/выходные
    │   ├── bottomSheet/
    │   ├── myLocation/
    │   ├── favoriteStops/
    │   └── featureToggle/
    ├── theme/     — стили, цвета
    └── ui/        — переиспользуемые компоненты
```

### Данные расписания

Расписание захардкожено в TypeScript-файле `src/shared/common/schedule.ts` как константа `SCHEDULE`.

**Интерфейс:**
```typescript
interface ISchedule {
  inSP: Record<number, Record<string, string[]>>   // в Северный Парк
  out: Record<number, Record<string, string[]>>     // в город
  inLB: Record<number, Record<string, string[]>>    // в Левобережный
}
```

**Структура данных:**
```
direction → dayOfWeek → stopName → ["8:15", "10:25", ...]
```

- Направления: `inSP` (в Северный парк), `out` (в город), `inLB` (в Левобережный)
- Дни недели: `'0'` (вс) – `'6'` (сб), совпадает с `Date.getDay()`
- Остановки: строковые ключи на русском (`Интернационалистов`, `пл. Ленина`, ...)
- Время: массив строк `"8:15"`, `"08:39"` (формат не нормализован)

**Contentful:** Есть код загрузки расписания из Contentful CMS (`src/shared/api/schedule.ts`), но `dispatch(setSchedule(...))` закомментирован — приложение использует захардкоженный `SCHEDULE`.

**Праздники:** Загружаются из Contentful, middleware переопределяет `currentDayKey` если сегодня — праздник.

### Направления и остановки

Enum `DirectionsNew`: `inSP`, `inLB`, `out`

При смене направления: меняется список остановок (`StopsInSpOptions`, `StopsInLbOptions`, `StopsOutOptions`), если текущая остановка не существует в новом направлении — сбрасывается.

### Жалобы (Complains)

**Фронтенд есть**, бэкенд — внешний GraphQL API на `popooga.ru` (этого сервера больше нет).

- Поллинг каждые 5 сек: `findComplains`
- Создание жалобы: мутация `createComplain`
- Типы жалоб: `earlier` (раньше), `later` (позже), `not_arrive` (не приехал), `passed_by` (проехал мимо)
- UI: список жалоб + шаблоны быстрых ответов (Fastreply)

### Деплой (текущий)

- GitHub Pages: `yarn build` → `gh-pages -d build`
- CI: `.github/workflows/deploy.yml` — push to `main` → build → deploy
- SPA на GitHub Pages: `public/404.html` + redirect-скрипт в `index.html`
- Домен: CNAME `severbus.ru`

### Бэкенд

**Отсутствует.** Нет серверного кода. Всё статика + внешние API (Contentful, popooga.ru GraphQL — мёртв).

## Будущая архитектура

### Цель

Перейти от статического SPA с захардкоженным расписанием к приложению с бэкендом, который:
1. Автоматически парсит расписание с сайта перевозчика (пассажир-онлайн)
2. Проксирует live-отслеживание автобусов (обход CORS)
3. Хранит и отдаёт жалобы (замена мёртвого popooga.ru)
4. Отдаёт расписание в том же формате `ISchedule` чтобы минимизировать доработки фронта

### Компоненты

```
VDS (один сервер, тот же что reservation-service / slotik.tech)
│
├── /opt/reverse-proxy/                ← отдельная репа (ndrwbv/reverse-proxy)
│   ├── nginx (80/443)                 ← маршрутизация по домену
│   │   ├── severbus.ru/* ──────────── → frontend static + SPA fallback
│   │   ├── severbus.ru/api/* ──────── → severbus-backend:3000
│   │   ├── slotik.tech/* ─────────── → reservation static + backend
│   │   └── admin.slotik.tech/* ────── → admin static + backend
│   └── certbot                        ← SSL для всех доменов
│
├── /opt/severbus/                     ← этот проект
│   ├── severbus-backend (Express)
│   │   ├── /api/schedule              ← расписание в формате ISchedule
│   │   ├── /api/complains             ← жалобы
│   │   ├── /api/live                  ← прокси live-позиции автобусов
│   │   ├── /api/health                ← мониторинг
│   │   └── Cron: парсинг расписания
│   ├── frontend-dist/                 ← собранный Vite SPA (volume для nginx)
│   └── data/                          ← SQLite
│
└── /opt/reservation-service/          ← slotik.tech (мигрирован, без своего nginx)
    ├── reservation-backend (Express)
    ├── frontend-dist/
    ├── admin-dist/
    ├── landing/dist/
    └── data/

Все бэкенды подключены к общей docker network "shared-proxy".
Reverse-proxy nginx видит их по имени контейнера.
```

```
                Внешние источники
┌──────────────────────────────────────┐
│  пассажир-онлайн                     │
│  - расписание (Word-файл)            │
│  - live API (позиции автобусов)      │
└───────────────┬──────────────────────┘
                │
                ▼
┌──────────────────────────────────────┐
│  severbus-backend (Express + SQLite) │
│                                      │
│  Cron → парсинг Word → /api/schedule │
│  Прокси → live API → /api/live       │
│  CRUD → /api/complains               │
└──────────────────────────────────────┘
```

### Деплой

- **Reverse-proxy** (отдельная репа `ndrwbv/reverse-proxy`): nginx + certbot, общий для всех проектов на VDS
- **severbus** (docker-compose): только backend, подключён к `shared-proxy` network. Фронтенд — статика в `frontend-dist/`, отдаётся nginx из reverse-proxy
- **reservation-service**: мигрирован на ту же архитектуру (nginx/certbot убраны из его compose)
- CI/CD: push to main → build frontend → rsync → docker-compose up
- SSL: Let's Encrypt через certbot в reverse-proxy

### API бэкенда (планируемый)

| Метод | Эндпоинт | Описание |
|-------|----------|----------|
| GET | `/api/schedule` | Расписание в формате `ISchedule` |
| GET | `/api/live` | Прокси live-позиции автобусов с пассажир-онлайн |
| GET | `/api/complains` | Список жалоб за сегодня |
| POST | `/api/complains` | Создать жалобу |
| POST | `/api/schedule/refresh` | Триггер ручного обновления расписания |
| GET | `/api/health` | Мониторинг (CPU, БД, статус API, статистика) |

### Хранение данных (SQLite)

- **schedule** — распаршенное расписание, дата последнего обновления
- **complains** — жалобы пользователей
- **users** — анонимные ID для трекинга (UUID, без персональных данных)
- **schedule_meta** — метаданные: когда последний раз обновлено, хеш файла

## Ключевые ограничения и решения

| Проблема | Решение |
|----------|---------|
| Расписание захардкожено в TS | Бэкенд парсит Word с пассажир-онлайн и отдаёт через API |
| Live-отслеживание блокируется CORS | Бэкенд проксирует запросы |
| Бэкенд для жалоб мёртв (popooga.ru) | Свой Express + SQLite |
| Деплой через GitHub Pages | Docker Compose (backend) + общий reverse-proxy (nginx + certbot) на том же VDS что reservation-service |
| Расписание обновлялось руками | Cron-задача + ручной триггер + AI-парсинг Word |
