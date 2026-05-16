#!/usr/bin/env bash
# ============================================================================
# setup-tiles.sh — Готовит PMTiles, шрифты и стиль для самохостинга карты
#
# Идемпотентен: повторный запуск ничего не качает заново.
# Может запускаться где угодно — на ноутбуке (с последующим rsync) или прямо
# на VDS из деплойного пайплайна.
#
# Запуск: bash scripts/setup-tiles.sh [OUTPUT_DIR]
#   OUTPUT_DIR — куда складывать файлы (по умолчанию ./tiles-output)
#
# Env:
#   PMTILES_PLANET_URL — переопределить URL планетарного билда.
#                        По умолчанию берётся самый свежий с build.protomaps.com.
#
# Результат:
#   $OUTPUT_DIR/tomsk.pmtiles    — векторные тайлы региона Томска
#   $OUTPUT_DIR/style.json       — стиль карты для MapLibre GL
#   $OUTPUT_DIR/fonts/           — шрифты (PBF glyphs)
#   $OUTPUT_DIR/pmtiles          — закешированный CLI (для следующих запусков)
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

# Protomaps weekly builds: https://build.protomaps.com/ (публичный S3 листинг).
# Если PMTILES_PLANET_URL не задан в env — берём самый свежий YYYYMMDD.pmtiles.
PMTILES_BUILDS_INDEX="https://build.protomaps.com/"

resolve_latest_build_url() {
  local latest
  latest=$(curl -fsSL "$PMTILES_BUILDS_INDEX" \
    | grep -oE '[0-9]{8}\.pmtiles' \
    | sort -ur \
    | head -n1)
  if [ -z "$latest" ]; then
    return 1
  fi
  echo "${PMTILES_BUILDS_INDEX}${latest}"
}

echo "=== Severbus: Настройка самохостинга тайлов ==="
echo ""

mkdir -p "$OUTPUT_DIR/fonts/Noto Sans Regular"

# ──────────────────────────────────────────────
# 1. Скачиваем PMTiles CLI (если нет)
# ──────────────────────────────────────────────
PMTILES_BIN_LOCAL="$OUTPUT_DIR/pmtiles"

if command -v pmtiles &> /dev/null; then
  PMTILES_BIN="pmtiles"
  echo "[1/4] pmtiles CLI найден в PATH"
elif [ -x "$PMTILES_BIN_LOCAL" ]; then
  PMTILES_BIN="$PMTILES_BIN_LOCAL"
  echo "[1/4] pmtiles CLI уже скачан в $PMTILES_BIN_LOCAL"
else
  echo "[1/4] Скачиваю pmtiles CLI..."

  # go-pmtiles использует goreleaser naming: go-pmtiles_<ver>_Linux_x86_64.tar.gz
  # (с заглавным OS и x86_64 вместо amd64). URL /latest/download/<file> не работает,
  # потому что имя файла включает версию — ищем asset через GitHub API.
  OS_RAW=$(uname -s)
  ARCH_RAW=$(uname -m)
  case "$ARCH_RAW" in
    x86_64|amd64)   GR_ARCH="x86_64" ;;
    arm64|aarch64)  GR_ARCH="arm64" ;;
    *) echo "  ОШИБКА: неподдерживаемая архитектура $ARCH_RAW"; exit 1 ;;
  esac

  ASSET_URL=$(curl -fsSL "https://api.github.com/repos/protomaps/go-pmtiles/releases/latest" \
    | grep '"browser_download_url"' \
    | grep -E "${OS_RAW}_${GR_ARCH}\\.tar\\.gz\"" \
    | head -n1 \
    | sed -E 's/.*"browser_download_url": "([^"]+)".*/\1/')

  if [ -z "$ASSET_URL" ]; then
    echo "  ОШИБКА: не нашёл pmtiles release для ${OS_RAW}/${GR_ARCH}"
    echo "  Проверь https://github.com/protomaps/go-pmtiles/releases/latest"
    exit 1
  fi

  echo "  Качаю: $ASSET_URL"
  curl -fsSL "$ASSET_URL" | tar xz -C "$OUTPUT_DIR" pmtiles
  chmod +x "$PMTILES_BIN_LOCAL"
  PMTILES_BIN="$PMTILES_BIN_LOCAL"
  echo "  pmtiles CLI установлен в $PMTILES_BIN_LOCAL"
fi

# ──────────────────────────────────────────────
# 2. Извлекаем регион Томска из планетарного билда
# ──────────────────────────────────────────────
PMTILES_FILE="$OUTPUT_DIR/tomsk.pmtiles"

if [ -f "$PMTILES_FILE" ]; then
  echo "[2/4] tomsk.pmtiles уже существует, пропускаю"
else
  if [ -z "${PMTILES_PLANET_URL:-}" ]; then
    echo "[2/4] Ищу последний билд Protomaps..."
    if ! PMTILES_PLANET_URL=$(resolve_latest_build_url); then
      echo "  ОШИБКА: не удалось разобрать листинг $PMTILES_BUILDS_INDEX"
      echo "  Передайте URL вручную через env PMTILES_PLANET_URL"
      exit 1
    fi
    echo "  Найден: $PMTILES_PLANET_URL"
  else
    echo "[2/4] Использую заданный PMTILES_PLANET_URL=$PMTILES_PLANET_URL"
  fi

  echo "  Извлекаю регион Томска (это 5-15 минут, качается только bbox)..."
  echo "  Bbox: $BBOX_MIN_LON,$BBOX_MIN_LAT,$BBOX_MAX_LON,$BBOX_MAX_LAT"

  "$PMTILES_BIN" extract \
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
du -sh "$OUTPUT_DIR"/* 2>/dev/null || true
