#!/usr/bin/env bash
#
# Заливает расписание готовым JSON в прод через POST /api/schedule/refresh-json.
#
# Нужно, потому что расписание живёт в SQLite на VDS: коммит в репозиторий
# обновляет только сид (backend/src/data/schedule-seed.json), который
# применяется лишь к пустой БД. Живой сайт обновляется этим запросом.
#
#   ADMIN_TOKEN=xxx ./scripts/push-schedule.sh
#   ADMIN_TOKEN=xxx ./scripts/push-schedule.sh specs/schedule-2026-08-payload.json
#
# ADMIN_TOKEN берётся из окружения или из .env в корне репозитория.
set -euo pipefail

PAYLOAD="${1:-specs/schedule-2026-08-payload.json}"
API_URL="${API_URL:-https://severbus.ru/api}"

if [ ! -f "$PAYLOAD" ]; then
  echo "Error: файл payload не найден: $PAYLOAD"
  exit 1
fi

if [ -z "${ADMIN_TOKEN:-}" ] && [ -f .env ]; then
  # shellcheck disable=SC1091
  source .env
fi

if [ -z "${ADMIN_TOKEN:-}" ]; then
  echo "Error: не задан ADMIN_TOKEN (переменная окружения или .env)"
  exit 1
fi

echo "==> POST $API_URL/schedule/refresh-json ($PAYLOAD)"
curl -sS -X POST "$API_URL/schedule/refresh-json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H 'Content-Type: application/json' \
  --data-binary "@$PAYLOAD" \
  -w '\nHTTP %{http_code}\n'

echo
echo "==> Проверка того, что отдаёт сайт:"
curl -sS "$API_URL/schedule" | head -c 400
echo
