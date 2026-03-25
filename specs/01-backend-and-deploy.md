# Фича: Бэкенд + деплой

**Ветка:** `01-backend-and-deploy`
**Создана:** 2026-03-25
**Статус:** не начат

## Контекст

**Зачем:** Сейчас severbus.ru — статический SPA на GitHub Pages без бэкенда. Бэкенд для жалоб (popooga.ru) мёртв. Чтобы добавлять любую серверную функциональность (парсинг расписания, прокси live API, жалобы, мониторинг) — нужен свой бэкенд и нормальный деплой.

**Что есть сейчас:** Фронтенд деплоится через `gh-pages` на GitHub Pages с CNAME `severbus.ru`. Бэкенда нет. Фронтенд лежит в корне репозитория — `src/`, `public/`, `package.json`, `vite.config.ts` всё в корне.

**Инфраструктура:** Деплой на тот же VDS, где стоит reservation-service (slotik.tech). Общий reverse-proxy (nginx + certbot) в отдельном репозитории обслуживает оба домена. Каждый проект поднимает только свой бэкенд, без собственного nginx/certbot.

**Референс:** Деплой-инфраструктура reservation-service (`/Users/andrewboev/Desktop/not-work/reservation-service`) — адаптируется под новую архитектуру.

## Архитектура деплоя

### Общая схема на VDS

```
VDS (один сервер)
│
├── /opt/reverse-proxy/              ← отдельная репа, общий nginx + certbot
│   ├── docker-compose.yml           ← nginx + certbot
│   ├── nginx/conf.d/
│   │   ├── severbus.conf            ← severbus.ru → severbus-backend + static
│   │   └── slotik.conf              ← slotik.tech → reservation-backend + static
│   ├── certbot/                     ← сертификаты для всех доменов
│   ├── scripts/init-letsencrypt.sh
│   └── README.md
│
├── /opt/severbus/                   ← этот проект
│   ├── docker-compose.yml           ← только backend (без nginx/certbot)
│   ├── backend/
│   ├── frontend-dist/               ← собранный фронтенд (volume для reverse-proxy)
│   └── data/                        ← SQLite volume
│
└── /opt/reservation-service/        ← существующий проект (мигрирует)
    ├── docker-compose.yml           ← только backend (nginx/certbot убираются)
    ├── backend/
    ├── frontend-dist/
    ├── admin-dist/
    ├── landing/dist/
    └── data/
```

### Docker network

Все compose-проекты подключаются к общей external network `shared-proxy`. Reverse-proxy видит бэкенды по имени контейнера.

```
shared-proxy (docker network)
├── reverse-proxy-nginx      → слушает 80/443
├── severbus-backend         → expose 3000
└── reservation-backend      → expose 3000
```

### reverse-proxy (отдельная репа)

**docker-compose.yml:**
```yaml
networks:
  shared-proxy:
    external: true

services:
  nginx:
    image: nginx:alpine
    container_name: reverse-proxy-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - ./certbot/conf:/etc/letsencrypt:ro
      - ./certbot/www:/var/www/certbot:ro
      # static volumes из проектов
      - /opt/severbus/frontend-dist:/var/www/severbus:ro
      - /opt/reservation-service/frontend-dist:/var/www/slotik:ro
      - /opt/reservation-service/admin-dist:/var/www/slotik-admin:ro
      - /opt/reservation-service/landing/dist:/var/www/slotik-landing:ro
    networks:
      - shared-proxy

  certbot:
    image: certbot/certbot
    container_name: reverse-proxy-certbot
    volumes:
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"
```

**nginx/conf.d/severbus.conf:**
```nginx
server {
    listen 80;
    server_name severbus.ru www.severbus.ru;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name severbus.ru www.severbus.ru;

    ssl_certificate /etc/letsencrypt/live/severbus.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/severbus.ru/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location /api/ {
        proxy_pass http://severbus-backend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /health {
        proxy_pass http://severbus-backend:3000;
    }

    location / {
        root /var/www/severbus;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
```

**nginx/conf.d/slotik.conf:** — перенос текущего `nginx.conf` из reservation-service (server blocks для slotik.tech + admin.slotik.tech), с заменой `backend:3000` на `reservation-backend:3000` и путей static на `/var/www/slotik*`.

### severbus (этот проект)

**docker-compose.yml** — только бэкенд, без nginx/certbot:
```yaml
networks:
  shared-proxy:
    external: true

services:
  backend:
    build: ./backend
    container_name: severbus-backend
    restart: unless-stopped
    expose:
      - "3000"
    env_file:
      - ./backend/.env
    environment:
      - NODE_ENV=production
    volumes:
      - ./data:/app/data
    networks:
      - shared-proxy
```

### reservation-service (миграция)

Из текущего `docker-compose.yml` убираются сервисы `nginx` и `certbot`. Остаётся только `backend`. Добавляется подключение к `shared-proxy` network. Контейнер переименовывается в `reservation-backend`.

---

## User Stories

### US-0 — Реструктуризация в монорепо (Приоритет: P0)

Перенести фронтенд из корня в `frontend/`, чтобы корень стал монорепо с `frontend/` и `backend/` на одном уровне.

**Почему этот приоритет:** Без реструктуризации backend и frontend будут перемешаны в корне — два `package.json`, два `tsconfig`, конфликты. Делается первым шагом, до бэкенда.

**Как проверить независимо:** `cd frontend && npm run build` → сборка проходит. Текущий GitHub Pages деплой продолжает работать.

**Сценарии приёмки:**

1. **Дано** проект реструктуризирован, **Когда** `cd frontend && npm run build`, **Тогда** сборка проходит без ошибок
2. **Дано** проект реструктуризирован, **Когда** `cd frontend && npm run dev`, **Тогда** dev-сервер работает
3. **Дано** push в main, **Когда** CI собирает и деплоит на GitHub Pages, **Тогда** сайт работает как раньше (пока не переключились на свой сервер)

**Что переносится в `frontend/`:**
- `src/`, `public/` — исходники
- `package.json`, `package-lock.json` / `yarn.lock`
- `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`
- `.eslintrc.*`, `.prettierrc`, `index.html`
- Всё остальное специфичное для фронтенда

**Что остаётся в корне:**
- `docker-compose.yml`, `scripts/`
- `specs/`, `context.md`, `README.md`
- `.github/workflows/`
- `.env.example` (корневой, для деплоя)

**Новая структура:**
```
/
├── frontend/              ← всё что сейчас в корне (React SPA)
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── index.html
│   └── .env.example
├── backend/               ← Express + SQLite (создаётся в US-1)
│   ├── src/
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   └── .env.example
├── docker-compose.yml     ← только backend (nginx живёт в reverse-proxy)
├── scripts/
│   └── deploy.sh
├── specs/
├── context.md
├── .env.example
├── .github/workflows/deploy.yml
└── README.md
```

---

### US-1 — Express-сервер с базовыми эндпоинтами (Приоритет: P1)

Минимальный Express-сервер на Node.js с SQLite, который стартует и отвечает на `/api/health`.

**Почему этот приоритет:** Без сервера нельзя двигаться дальше — все последующие фичи зависят от бэкенда.

**Как проверить независимо:** `curl http://localhost:3000/api/health` → 200 OK с JSON.

**Сценарии приёмки:**

1. **Дано** запущен бэкенд, **Когда** GET `/api/health`, **Тогда** ответ 200 с `{ "status": "ok" }`
2. **Дано** запущен бэкенд, **Когда** БД файл не существует, **Тогда** он создаётся автоматически при старте

---

### US-2 — Docker Compose + подключение к reverse-proxy (Приоритет: P1)

`docker-compose.yml` поднимает бэкенд и подключается к shared-proxy network. Фронтенд отдаётся через reverse-proxy nginx (volume `frontend-dist/`).

**Почему этот приоритет:** Без деплоя ничего не доедет до пользователей.

**Как проверить независимо:** `docker-compose up -d --build` → бэкенд доступен из shared-proxy network → reverse-proxy проксирует запросы.

**Сценарии приёмки:**

1. **Дано** shared-proxy network создана, **Когда** `docker-compose up -d --build`, **Тогда** контейнер `severbus-backend` поднимается и подключён к сети
2. **Дано** reverse-proxy запущен, **Когда** открыть `severbus.ru`, **Тогда** отдаётся фронтенд (SPA) из `frontend-dist/`
3. **Дано** reverse-proxy запущен, **Когда** GET `severbus.ru/api/health`, **Тогда** nginx проксирует на `severbus-backend:3000`, ответ 200
4. **Дано** контейнеры запущены, **Когда** `docker-compose restart`, **Тогда** данные SQLite на месте (volume)

---

### US-3 — CI/CD: автодеплой при push в main (Приоритет: P2)

GitHub Actions: push to `main` → build фронтенд → rsync на сервер → `docker-compose up -d --build`. Аналог workflow из reservation-service.

**Почему этот приоритет:** Можно деплоить руками первое время, автоматизация — следующий шаг.

**Сценарии приёмки:**

1. **Дано** новый коммит в `main`, **Когда** push, **Тогда** workflow: build frontend → rsync → compose up → health check
2. **Дано** фронтенд не собрался, **Тогда** деплой не запускается

---

### US-R — Создание reverse-proxy репозитория (Приоритет: P1)

Отдельный репозиторий `reverse-proxy` с общим nginx + certbot для всех проектов на VDS.

**Почему этот приоритет:** Без reverse-proxy ни severbus, ни reservation-service не будут доступны по доменам после миграции.

**Сценарии приёмки:**

1. **Дано** reverse-proxy задеплоен, **Когда** `docker-compose up -d`, **Тогда** nginx слушает 80/443, certbot работает
2. **Дано** reverse-proxy + severbus запущены, **Когда** `curl https://severbus.ru`, **Тогда** отдаётся фронтенд
3. **Дано** reverse-proxy + reservation-service запущены, **Когда** `curl https://slotik.tech`, **Тогда** всё работает как раньше

---

### US-M — Миграция reservation-service (Приоритет: P1)

Убрать nginx и certbot из docker-compose.yml reservation-service. Бэкенд подключается к shared-proxy network. Reverse-proxy берёт на себя SSL и маршрутизацию.

**Почему этот приоритет:** Нельзя запустить reverse-proxy пока reservation-service держит порты 80/443.

**Как проверить независимо:** После миграции `slotik.tech` и `admin.slotik.tech` работают как раньше, но через reverse-proxy.

**Сценарии приёмки:**

1. **Дано** reservation-service мигрирован, **Когда** `docker-compose up -d`, **Тогда** поднимается только backend (без nginx/certbot)
2. **Дано** reverse-proxy + reservation-service запущены, **Когда** открыть `slotik.tech`, **Тогда** сайт работает
3. **Дано** reverse-proxy + reservation-service запущены, **Когда** открыть `admin.slotik.tech`, **Тогда** админка работает

---

## Переключение на свой сервер — пошаговый чеклист

Severbus деплоится на тот же VDS, где уже стоит reservation-service. Переключение включает миграцию reservation-service на общий reverse-proxy.

### Этап 1: Подготовка reverse-proxy (не затрагивает прод)

- [ ] Создать docker network: `docker network create shared-proxy`
- [ ] Создать репозиторий `reverse-proxy`
- [ ] `docker-compose.yml` — nginx + certbot + volumes для всех проектов
- [ ] `nginx/conf.d/slotik.conf` — перенести конфиг из reservation-service (адаптировать пути и имена контейнеров)
- [ ] `nginx/conf.d/severbus.conf` — конфиг для severbus.ru
- [ ] `scripts/init-letsencrypt.sh` — адаптировать под несколько доменов
- [ ] Протестировать локально (docker-compose config)

### Этап 2: Миграция reservation-service (кратковременный даунтайм slotik.tech)

- [ ] Снизить TTL DNS-записей slotik.tech (на случай проблем)
- [ ] На сервере: остановить reservation-service (`docker-compose down`)
- [ ] Обновить `docker-compose.yml` reservation-service — убрать nginx/certbot, добавить `shared-proxy` network, переименовать контейнер в `reservation-backend`
- [ ] Скопировать `certbot/conf/` из reservation-service в reverse-proxy (сертификаты slotik.tech)
- [ ] Запустить reverse-proxy (`docker-compose up -d`)
- [ ] Запустить reservation-service (`docker-compose up -d`)
- [ ] Проверить `https://slotik.tech` — работает через reverse-proxy
- [ ] Проверить `https://admin.slotik.tech` — работает

### Этап 3: Деплой severbus (до переключения DNS)

- [ ] Склонировать/rsync severbus на сервер в `/opt/severbus`
- [ ] Создать `backend/.env` на сервере
- [ ] Положить собранный фронтенд в `frontend-dist/`
- [ ] `docker-compose up -d --build` — бэкенд стартует в shared-proxy network
- [ ] Рестартнуть reverse-proxy чтобы подхватил volume `frontend-dist`
- [ ] Проверить `curl http://<IP>/api/health` через reverse-proxy → 200

### Этап 4: Переключение DNS severbus.ru

- [ ] Снизить TTL у A-записей `severbus.ru` до 60–300 секунд (за сутки до)
- [ ] Изменить A-запись `severbus.ru` → IP VDS
- [ ] Изменить A-запись `www.severbus.ru` → IP VDS (или CNAME → severbus.ru)
- [ ] Удалить CNAME для GitHub Pages

### Этап 5: SSL для severbus.ru

- [ ] Дождаться что `dig severbus.ru` возвращает IP VDS
- [ ] Добавить домен в certbot: `docker run --rm -v ... certbot/certbot certonly --webroot -d severbus.ru`
- [ ] Рестартнуть reverse-proxy nginx (подхватит новый сертификат)
- [ ] Проверить `https://severbus.ru` — работает

### Этап 6: Финализация

- [ ] Убедиться что GitHub Pages CNAME файл удалён из репозитория
- [ ] Вернуть TTL DNS-записей на нормальное значение (3600+)
- [ ] Обновить CI/CD workflow severbus — деплой rsync + compose up (вместо gh-pages)
- [ ] Обновить CI/CD workflow reservation-service — убрать шаги связанные с nginx/certbot

### Порядок и даунтайм

| Этап | Даунтайм | Что затрагивает |
|------|----------|-----------------|
| 1. Reverse-proxy | Нет | Ничего (подготовка) |
| 2. Миграция reservation | 2–5 мин | slotik.tech (остановка + запуск) |
| 3. Деплой severbus | Нет | Ничего (DNS ещё на GitHub Pages) |
| 4. DNS severbus.ru | 0 мин | severbus.ru (уже работает по HTTP) |
| 5. SSL severbus.ru | 5–15 мин | severbus.ru (HTTPS недоступен до certbot) |

**Минимизация:** этапы 2 и 4–5 делать поздно ночью.

---

## Переменные окружения

### `.env.example` (корень severbus, для деплоя)
```env
# Deploy (тот же VDS что и reservation-service)
DEPLOY_HOST=<IP сервера>
DEPLOY_USER=root
DEPLOY_PATH=/opt/severbus
```

### `backend/.env.example`
```env
PORT=3000
NODE_ENV=development
```

### `frontend/.env.example`
```env
# API URL бекенда (не нужен для prod — reverse-proxy проксирует /api)
# Для dev: VITE_API_URL=http://localhost:3000
VITE_API_URL=
```

### GitHub Secrets (для CI/CD)
| Secret | Описание |
|--------|----------|
| `SSH_PRIVATE_KEY` | SSH ключ для доступа к серверу (тот же что у reservation-service) |
| `DEPLOY_HOST` | IP сервера (тот же) |
| `DEPLOY_USER` | Пользователь SSH (обычно root) |
| `DEPLOY_PATH` | Путь на сервере (`/opt/severbus`) |

---

## Ключевые сущности

- **docker-compose.yml**: только backend, подключён к shared-proxy network
- **backend/**: Express + TypeScript + SQLite
- **backend/Dockerfile**: multi-stage build (аналог reservation-service)
- **frontend/**: React SPA (перенесён из корня)
- **reverse-proxy** (отдельная репа): nginx + certbot, конфиги для всех доменов
- **shared-proxy**: docker network, связывает reverse-proxy с бэкендами проектов

## Edge Cases

- Что если сервер упал и перезапустился? → `restart: unless-stopped` на всех контейнерах, данные в volume
- Что если SSL-сертификат истёк? → certbot в reverse-proxy renew каждые 12ч
- Что если reverse-proxy упал? → Оба сайта недоступны. `restart: unless-stopped` минимизирует риск
- Что если один проект упал? → Другой продолжает работать, reverse-proxy отдаёт 502 только для упавшего
- Что если DNS ещё не обновился? → GitHub Pages будет работать параллельно, пока DNS не переключится
- Что если нужно добавить третий проект? → Новый compose + один `.conf` в reverse-proxy

## Критерии приёмки

- [ ] Фронтенд перенесён в `frontend/`, сборка и dev-сервер работают
- [ ] Express-сервер стартует, отвечает на `/api/health`
- [ ] `docker-compose.yml` поднимает backend в shared-proxy network
- [ ] Reverse-proxy маршрутизирует: `severbus.ru/*` → фронтенд, `severbus.ru/api/*` → бэкенд
- [ ] SSL работает (Let's Encrypt через reverse-proxy)
- [ ] Фронтенд доступен по `https://severbus.ru`
- [ ] reservation-service (`slotik.tech`) продолжает работать через reverse-proxy
- [ ] Данные переживают `docker-compose restart`

## Задачи

### Реструктуризация (делается первым)
- [ ] Перенести фронтенд в `frontend/` (src, public, package.json, vite.config.ts, tsconfig, index.html и т.д.)
- [ ] Обновить пути в CI/CD (`cd frontend && npm run build`)
- [ ] Проверить что `npm run dev` и `npm run build` работают из `frontend/`
- [ ] Обновить GitHub Pages деплой для работы из `frontend/` (временно, до переключения)

### Backend
- [ ] Инициализировать `backend/` — package.json, tsconfig, Express, SQLite
- [ ] `backend/src/index.ts` — Express сервер на порту 3000
- [ ] `backend/src/routes/health.ts` — GET `/api/health`
- [ ] `backend/src/services/db.ts` — инициализация SQLite
- [ ] `backend/Dockerfile` — multi-stage build (аналог reservation-service)
- [ ] `backend/.env.example`

### Reverse-proxy (отдельная репа)
- [ ] Создать репозиторий `reverse-proxy`
- [ ] `docker-compose.yml` — nginx + certbot + shared-proxy network
- [ ] `nginx/conf.d/severbus.conf` — SPA static + API proxy + SSL
- [ ] `nginx/conf.d/slotik.conf` — перенос конфига из reservation-service
- [ ] `scripts/init-letsencrypt.sh` — первичная настройка SSL для нового домена
- [ ] README с описанием как добавить новый проект

### Миграция reservation-service
- [ ] Убрать nginx и certbot из docker-compose.yml
- [ ] Добавить shared-proxy network, переименовать контейнер
- [ ] Перенести certbot/conf (сертификаты) в reverse-proxy
- [ ] Обновить CI/CD workflow (убрать шаги nginx)
- [ ] Протестировать что slotik.tech работает через reverse-proxy

### Инфраструктура severbus
- [ ] `docker-compose.yml` — backend + shared-proxy network
- [ ] `scripts/deploy.sh` — ручной деплой (build + rsync + compose up)
- [ ] `.env.example` (корневой, для деплоя)

### CI/CD
- [ ] `.github/workflows/deploy.yml` — push to main → build frontend → rsync → compose up → health check
- [ ] Генерация `backend/.env` на сервере из GitHub Secrets (как в reservation-service)
- [ ] Бэкап БД перед рестартом
- [ ] Настроить secrets в GitHub (можно переиспользовать `SSH_PRIVATE_KEY` и `DEPLOY_HOST` от reservation-service)

### DNS + SSL (выполняется вручную на сервере)
- [ ] Выполнить миграцию reservation-service на reverse-proxy (этапы 1–2)
- [ ] Задеплоить severbus на сервер (этап 3)
- [ ] Переключить DNS severbus.ru (этап 4)
- [ ] Получить SSL-сертификат через reverse-proxy certbot (этап 5)
- [ ] Финализация: убрать GitHub Pages, обновить CI/CD (этап 6)
