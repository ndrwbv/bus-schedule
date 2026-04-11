# Контекст для настройки reverse-proxy: раздача тайлов карты

## Зачем

Проект severbus.ru (расписание автобусов, Томск) переходит на самохостинг тайлов карты.
Раньше тайлы грузились с `tiles.openfreemap.org` (зарубежный CDN), но в Томской области
глушат интернет и зарубежные сервисы недоступны. Теперь тайлы хранятся локально на VDS
и раздаются через nginx.

## Что нужно сделать

### 1. Добавить location в nginx конфиг severbus.ru

В файле конфигурации nginx для `severbus.ru` добавить location-блок
для раздачи тайлов как статических файлов:

```nginx
# Self-hosted map tiles (PMTiles + style + fonts)
location /tiles/ {
    alias /opt/severbus/data/tiles/;

    # CORS — MapLibre загружает тайлы через fetch
    add_header Access-Control-Allow-Origin "*" always;
    add_header Access-Control-Allow-Methods "GET, HEAD, OPTIONS" always;

    # Range requests — PMTiles использует HTTP Range для чтения фрагментов файла
    # nginx поддерживает это из коробки, просто убеждаемся что заголовки проходят
    add_header Accept-Ranges bytes always;

    # Кеширование — тайлы меняются раз в месяц
    add_header Cache-Control "public, max-age=86400" always;

    # Типы файлов
    types {
        application/json json;
        application/x-protobuf pbf;
        application/octet-stream pmtiles;
    }

    # Gzip для style.json и .pbf шрифтов
    gzip on;
    gzip_types application/json application/x-protobuf;
}
```

### 2. Добавить volume в docker-compose.yml reverse-proxy

Чтобы nginx-контейнер имел доступ к файлам тайлов на хосте:

```yaml
services:
  nginx:  # или как называется сервис
    volumes:
      # ... существующие volumes ...
      - /opt/severbus/data/tiles:/opt/severbus/data/tiles:ro
```

### 3. Перезапустить nginx

```bash
docker-compose restart nginx
# или
docker-compose up -d
```

## Структура файлов на VDS

```
/opt/severbus/data/tiles/
├── tomsk.pmtiles          # ~5-50 MB — векторные тайлы региона Томска
├── style.json             # ~3 KB — стиль карты MapLibre GL
└── fonts/
    └── Noto Sans Regular/ # ~2 MB — шрифты для текста на карте
        ├── 0-255.pbf
        ├── 256-511.pbf
        └── ...
```

## Как проверить

После настройки, эти URL должны отвечать:

```bash
# Style JSON
curl -I https://severbus.ru/tiles/style.json
# Ожидаем: 200 OK, Content-Type: application/json

# PMTiles (range request)
curl -I -H "Range: bytes=0-511" https://severbus.ru/tiles/tomsk.pmtiles
# Ожидаем: 206 Partial Content

# Шрифты
curl -I https://severbus.ru/tiles/fonts/Noto%20Sans%20Regular/0-255.pbf
# Ожидаем: 200 OK, Content-Type: application/x-protobuf
```

## Важные детали

- **Range requests обязательны** — PMTiles читает файл по частям через HTTP Range.
  nginx поддерживает это по умолчанию для `alias`/`root`, ничего специально делать не нужно.
- **CORS обязателен** — браузер загружает тайлы через `fetch()`,
  без CORS карта не покажется.
- **Volume read-only (`:ro`)** — nginx только читает файлы, писать не нужно.
- **gzip для .pbf** — шрифтовые файлы хорошо сжимаются, экономит трафик.
