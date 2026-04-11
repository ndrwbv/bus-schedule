#!/usr/bin/env bash
# ============================================================================
# setup-tiles.sh — Скачивает PMTiles, шрифты и стиль для самохостинга карты
#
# Запуск: bash scripts/setup-tiles.sh [OUTPUT_DIR]
#   OUTPUT_DIR — куда складывать файлы (по умолчанию ./tiles-output)
#
# Результат: директория с файлами, готовыми для загрузки на VDS:
#   tiles-output/
#     tomsk.pmtiles    — векторные тайлы региона Томска
#     style.json       — стиль карты для MapLibre GL
#     fonts/            — шрифты (PBF glyphs)
#
# После запуска скрипта загрузите файлы на VDS:
#   rsync -avz tiles-output/ user@host:/opt/severbus/data/tiles/
# ============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT_DIR="${1:-./tiles-output}"

# Bounding box для Томска и пригородов (маршрут 112С)
# Широта: 56.35 - 56.55, Долгота: 84.75 - 85.10
BBOX_MIN_LON=84.75
BBOX_MIN_LAT=56.35
BBOX_MAX_LON=85.10
BBOX_MAX_LAT=56.55

# Protomaps daily build — последний доступный
PMTILES_PLANET_URL="https://build.protomaps.com/20250101.pmtiles"

echo "=== Severbus: Настройка самохостинга тайлов ==="
echo ""

mkdir -p "$OUTPUT_DIR/fonts/Noto Sans Regular"

# ──────────────────────────────────────────────
# 1. Скачиваем PMTiles CLI (если нет)
# ──────────────────────────────────────────────
if ! command -v pmtiles &> /dev/null; then
  echo "[1/4] Скачиваю pmtiles CLI..."
  ARCH=$(uname -m)
  OS=$(uname -s | tr '[:upper:]' '[:lower:]')

  if [ "$ARCH" = "x86_64" ]; then ARCH="amd64"; fi
  if [ "$ARCH" = "aarch64" ]; then ARCH="arm64"; fi

  PMTILES_URL="https://github.com/protomaps/go-pmtiles/releases/latest/download/go-pmtiles_${OS}_${ARCH}.tar.gz"
  curl -L "$PMTILES_URL" | tar xz -C /tmp
  PMTILES_BIN="/tmp/pmtiles"
  chmod +x "$PMTILES_BIN"
  echo "  pmtiles CLI установлен в /tmp/pmtiles"
else
  PMTILES_BIN="pmtiles"
  echo "[1/4] pmtiles CLI уже установлен"
fi

# ──────────────────────────────────────────────
# 2. Извлекаем регион Томска из планетарного билда
# ──────────────────────────────────────────────
PMTILES_FILE="$OUTPUT_DIR/tomsk.pmtiles"

if [ -f "$PMTILES_FILE" ]; then
  echo "[2/4] tomsk.pmtiles уже существует, пропускаю"
else
  echo "[2/4] Извлекаю регион Томска из планетарного билда..."
  echo "  Это может занять 5-15 минут (скачивается только нужная область)"
  echo "  Bbox: $BBOX_MIN_LON,$BBOX_MIN_LAT,$BBOX_MAX_LON,$BBOX_MAX_LAT"
  echo ""
  echo "  ВАЖНО: Если URL не работает, найдите актуальный билд на:"
  echo "  https://maps.protomaps.com/builds/"
  echo "  и передайте его через переменную PMTILES_PLANET_URL"
  echo ""

  $PMTILES_BIN extract \
    "${PMTILES_PLANET_URL}" \
    "$PMTILES_FILE" \
    --bbox="${BBOX_MIN_LON},${BBOX_MIN_LAT},${BBOX_MAX_LON},${BBOX_MAX_LAT}" \
    --maxzoom=15

  echo "  Готово! Размер: $(du -h "$PMTILES_FILE" | cut -f1)"
fi

# ──────────────────────────────────────────────
# 3. Скачиваем шрифты (Noto Sans Regular — для cluster count)
# ──────────────────────────────────────────────
FONTS_DIR="$OUTPUT_DIR/fonts/Noto Sans Regular"
FONTS_BASE_URL="https://github.com/protomaps/basemaps-assets/raw/main/fonts/Noto%20Sans%20Regular"

if [ -f "$FONTS_DIR/0-255.pbf" ]; then
  echo "[3/4] Шрифты уже скачаны, пропускаю"
else
  echo "[3/4] Скачиваю шрифты (Noto Sans Regular)..."
  for RANGE in \
    "0-255" "256-511" "512-767" "768-1023" "1024-1279" "1280-1535" \
    "1536-1791" "1792-2047" "2048-2303" "2304-2559" "2560-2815" \
    "2816-3071" "3072-3327" "3328-3583" "3584-3839" "3840-4095" \
    "4096-4351" "4352-4607" "4608-4863" "4864-5119" "5120-5375" \
    "5376-5631" "5632-5887" "5888-6143" "6144-6399" "6400-6655" \
    "6656-6911" "6912-7167" "7168-7423" "7424-7679" "7680-7935" \
    "7936-8191" "8192-8447" "8448-8703" "8704-8959" "8960-9215" \
    "9216-9471" "9472-9727" "9728-9983" "9984-10239" "10240-10495" \
    "10496-10751" "10752-11007" "11008-11263" "11264-11519" \
    "11520-11775" "11776-12031" "12032-12287" "12288-12543" \
    "12544-12799" "12800-13055" "13056-13311" "53248-53503" \
    "54272-54527" "54528-54783" "54784-55039" "55040-55295" \
    "55296-55551" "56320-56575" "56576-56831" "56832-57087" \
    "57088-57343" "57344-57599" "57600-57855" "57856-58111" \
    "58112-58367" "58368-58623" "65024-65279" "65280-65535"; do
    curl -sfL "${FONTS_BASE_URL}/${RANGE}.pbf" -o "$FONTS_DIR/${RANGE}.pbf" 2>/dev/null || true
  done

  # Проверяем что хотя бы основные диапазоны скачались
  if [ -f "$FONTS_DIR/0-255.pbf" ]; then
    FONT_COUNT=$(find "$FONTS_DIR" -name "*.pbf" | wc -l)
    echo "  Скачано $FONT_COUNT файлов шрифтов"
  else
    echo "  ОШИБКА: не удалось скачать шрифты"
    echo "  Попробуйте скачать вручную из:"
    echo "  https://github.com/protomaps/basemaps-assets/tree/main/fonts"
    exit 1
  fi
fi

# ──────────────────────────────────────────────
# 4. Копируем style.json
# ──────────────────────────────────────────────
echo "[4/4] Копирую style.json..."
cp "$SCRIPT_DIR/tiles/style.json" "$OUTPUT_DIR/style.json"
echo "  Готово"

# ──────────────────────────────────────────────
# Итог
# ──────────────────────────────────────────────
echo ""
echo "=== Все файлы готовы в $OUTPUT_DIR ==="
echo ""
du -sh "$OUTPUT_DIR"/* 2>/dev/null || true
echo ""
echo "Следующие шаги:"
echo "  1. Загрузите файлы на VDS:"
echo "     rsync -avz $OUTPUT_DIR/ user@host:/opt/severbus/data/tiles/"
echo ""
echo "  2. Настройте nginx (в reverse-proxy репо) для раздачи /tiles/"
echo "     (см. PR с контекстом для reverse-proxy)"
echo ""
echo "  3. Задеплойте frontend с VITE_MAP_STYLE_URL=/tiles/style.json"
