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
├── specs/
├── .github/workflows/
│   ├── ci.yml             — lint + build на PR
│   └── deploy.yml         — деплой на push в main
├── .env.example           ← переменные для деплоя
├── context.md
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

### Деплой

- **Production:** Docker Compose (backend) + общий reverse-proxy (nginx + certbot) на VDS
- CI/CD: `.github/workflows/deploy.yml` — push to `main` → yarn build frontend → rsync → docker-compose up
- Ручной деплой: `scripts/deploy.sh`
- Фронтенд раздаётся nginx из reverse-proxy (volume `frontend-dist/`)
- **Временно:** DNS ещё на GitHub Pages, переключение по чеклисту из спеки `01-backend-and-deploy`

### Бэкенд

- **Стек:** Express 4 + TypeScript, better-sqlite3
- **Эндпоинт:** GET `/api/health` — статус, uptime, память, БД
- **База:** SQLite (`data/severbus.db`), WAL mode
- **Docker:** multi-stage build (node:20-alpine), порт 3000

## Будущая архитектура

### Цель

Перейти от статического SPA с захардкоженным расписанием к приложению с бэкендом, который:
1. Автоматически парсит расписание с Cloud Mail.ru (гибридный парсер: детерм. + LLM fallback, поддержка docx/pdf/скриншотов)
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
│  пассажир-онлайн (ООО "ЕТВ")        │
│  - сайт: ссылки на расписания       │
│  - live API (позиции автобусов)      │
│                                      │
│  Cloud Mail.ru                       │
│  - хостинг Word-файла расписания     │
└───────────────┬──────────────────────┘
                │
                ▼
┌──────────────────────────────────────┐
│  severbus-backend (Express + SQLite) │
│                                      │
│  Cron → скрейп сайта → скачивание    │
│       → парсинг → валидация          │
│       → /api/schedule                │
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

## Источник расписания

**Перевозчик:** ООО "ЕТВ"
**Сайт:** `https://xn--80aasi5akda.online/documents` (пассажир-онлайн)
**Файл:** `Расписание 112С.docx` — публикуется на Cloud Mail.ru, ссылка меняется при обновлении

Перевозчик публикует расписание маршрута №112С в виде Word-файла. На сайте перевозчика в секции «112С маршрут» есть «Расписание в файле (Word) - ссылка», которая ведёт на Cloud Mail.ru. Файл содержит 4 таблицы: будни (2 таблицы по 14 рейсов), суббота (15 рейсов), воскресенье (12 рейсов). Каждая таблица разделена на две половины: верхняя — направление в СП, нижняя — из СП в город. Рейсы с пометкой «1» идут через мкр. Левобережный Лайф. Подробная структура файла — в `specs/02-schedule-parser.md`.

**Скачивание (двухэтапное):**
1. Скрейпинг `xn--80aasi5akda.online/documents` → поиск ссылки на Word-файл 112С → получаем URL Cloud Mail.ru
2. Скачивание с Cloud Mail.ru без авторизации: GET страницу → `weblink_get` URL → `/api/v2/tokens/download` → скачать файл

Fallback — ручная загрузка файла через `POST /api/schedule/refresh`.

## Стратегия парсинга расписания

### Проблема хрупкости парсера

Детерминированный парсер ломается при любом изменении формата файла. Если перевозчик поменяет структуру таблиц, порядок колонок или вообще начнёт публиковать скриншот вместо docx — парсер перестанет работать.

### Решение: гибридная цепочка

```
1. Скачать файл → сохранить оригинал
2. Детерминированный парсер (XML из docx) — бесплатно, быстро
3. Валидация результата (санити-чеки)
4. Если не прошёл → LLM-парсинг (GPT-4o / Claude) — текст или изображение
5. Повторная валидация
6. Если снова не прошёл → алерт админу, расписание НЕ обновляется
```

В 99% случаев работает бесплатный детерминированный парсер. LLM включается автоматически при смене формата.

### Поддержка разных форматов

LLM с vision унифицирует парсер — один пайплайн для любого формата:

| Формат | Метод | Стоимость |
|--------|-------|-----------|
| .docx | Детерминированный (XML) → LLM fallback | Бесплатно / ~$0.01-0.05 |
| .pdf | pdf-parse → LLM fallback | Бесплатно / ~$0.01-0.05 |
| Скриншот (PNG/JPG) | LLM с vision (OCR + структурирование) | ~$0.01-0.05 |

### Валидация результата

Перед сохранением — санити-чеки:
- Есть все 3 направления, все дни недели
- Достаточное количество остановок и рейсов
- Времена валидные и идут по возрастанию
- При обновлении: если >50% рейсов изменилось — подозрительно, требует подтверждения

## Планы по улучшению UI навигации (P3)

Текущий UI: выбрать направление → выбрать остановку из списка. Для постоянного пользователя — лишние клики каждый день. Планируемые улучшения (после стабильной работы парсера):

- **Избранные как главный экран** — открыл приложение → сразу видишь «через 12 мин» для своей остановки, без дропдаунов
- **Маршрутная линия** — визуальная линия с точками-остановками (как в транспортных приложениях). Тап по точке → расписание. Видно: где ты на маршруте, сколько до конечной
- **Свайп между остановками** — на экране расписания свайп влево/вправо переходит к соседней остановке
- **«Откуда → Куда»** — вместо «направление + остановка» пользователь выбирает две точки, система сама определяет направление
- **Поиск** — начал печатать «Инт...» → подсказка «Интернационалистов»

## Ключевые ограничения и решения

| Проблема | Решение |
|----------|---------|
| Расписание захардкожено в TS | Бэкенд парсит Word с Cloud Mail.ru и отдаёт через API |
| Парсер ломается при смене формата | Гибридная цепочка: детерминированный → LLM fallback |
| Перевозчик может публиковать скриншот | LLM с vision парсит изображения |
| Live-отслеживание блокируется CORS | Бэкенд проксирует запросы |
| Бэкенд для жалоб мёртв (popooga.ru) | Свой Express + SQLite |
| Деплой через GitHub Pages | Docker Compose (backend) + общий reverse-proxy (nginx + certbot) на том же VDS что reservation-service |
| Расписание обновлялось руками | Cron-задача + ручной триггер + AI-парсинг Word |
| Неудобная навигация по остановкам | [P3] Избранные, маршрутная линия, свайп, «откуда→куда» |
