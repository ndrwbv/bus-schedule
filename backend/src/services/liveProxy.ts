import { getDb } from './db';
import { logger } from './logger';
import type { TrackedBus } from './live/tracker';

const LIVE_API_URL = new URL('https://map.xn--80aasi5akda.online/api/units');
const LIVE_ROUTE_IDS = process.env.LIVE_ROUTE_IDS || '97941,97942';
LIVE_API_URL.searchParams.set('groups', LIVE_ROUTE_IDS.replace(/\s/g, ''));
// Чуть меньше интервала фонового опроса, чтобы каждый тик поллера доходил до перевозчика
const CACHE_TTL_MS = 9_000;
const WARNING_INTERVAL_MS = 60_000;
const POLL_INTERVAL_MS = 10_000;
/** Томск — UTC+7 без перехода на летнее время */
const TOMSK_UTC_OFFSET_MIN = 7 * 60;
/** Фоновый опрос не идёт с 00:30 до 05:30 по Томску — автобусы не ходят */
const QUIET_FROM_MIN = 30;
const QUIET_TO_MIN = 5 * 60 + 30;

export type BusPosition = TrackedBus;

interface CacheEntry {
  buses: BusPosition[];
  fetchedAt: number;
}

interface PassengerOnlineUnit {
  id: number;
  lat: number | null;
  lon: number | null;
  online: boolean;
  dir?: unknown;
  hdg?: unknown;
  course?: unknown;
  speed?: unknown;
}

interface PassengerOnlineResponse {
  units: PassengerOnlineUnit[];
  data_state?: { state: string };
  stale?: boolean;
  demo?: boolean;
}

let cache: CacheEntry | null = null;
let retryAfter = 0;
let lastWarningAt = -Infinity;
/** Запрос к перевозчику в полёте — поллер и пользователи не дублируют его */
let inFlight: Promise<BusPosition[]> | null = null;

export async function fetchLiveBuses(): Promise<BusPosition[]> {
  const now = Date.now();
  if (now < retryAfter || (cache && now - cache.fetchedAt < CACHE_TTL_MS)) {
    return cache?.buses ?? [];
  }

  inFlight ??= fetchUpstream().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

function upstreamUnavailable(reason: string, details: Record<string, unknown> = {}): BusPosition[] {
  const now = Date.now();
  retryAfter = now + CACHE_TTL_MS;
  if (now - lastWarningAt >= WARNING_INTERVAL_MS) {
    lastWarningAt = now;
    logger.warn({ ...details, reason, hasCache: cache !== null }, '[liveProxy] Координаты перевозчика недоступны');
  }
  return cache?.buses ?? [];
}

function isUnit(unit: unknown): unit is PassengerOnlineUnit {
  if (!unit || typeof unit !== 'object') return false;
  const { id, lat, lon, online } = unit as Partial<PassengerOnlineUnit>;
  return Number.isSafeInteger(id)
    && typeof online === 'boolean'
    && (lat === null || (typeof lat === 'number' && Number.isFinite(lat) && Math.abs(lat) <= 90))
    && (lon === null || (typeof lon === 'number' && Number.isFinite(lon) && Math.abs(lon) <= 180));
}

function directionFromDestination(destination: unknown): BusPosition['direction'] {
  if (typeof destination !== 'string') return null;
  switch (destination.trim().toLowerCase()) {
    case 'томск': return 'out';
    case 'северный парк': return 'inLB';
    default: return null;
  }
}

function isBearing(value: unknown): value is number {
  return typeof value === 'number' && value >= 0 && value < 360;
}

function bearingFromUnit({ hdg, speed, course }: PassengerOnlineUnit): number | null {
  if (isBearing(hdg)) return hdg;
  if (typeof speed === 'number' && Number.isFinite(speed) && speed >= 10 && isBearing(course)) {
    return course;
  }
  return null;
}

async function fetchUpstream(): Promise<BusPosition[]> {
  try {
    const response = await fetch(LIVE_API_URL, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(5000),
    });

    const status = response.status;
    if (!response.ok) {
      return upstreamUnavailable('http_error', { status });
    }

    const body = await response.text();
    if (!body.trim()) return upstreamUnavailable('empty_body', { status });

    let data: PassengerOnlineResponse | null;
    try {
      data = JSON.parse(body);
    } catch {
      return upstreamUnavailable('invalid_json', { status });
    }

    const state = data?.data_state?.state;
    if (data?.demo || data?.stale || (state !== undefined && state !== 'ok')) {
      return upstreamUnavailable('data_unavailable', { status });
    }
    if (!Array.isArray(data?.units) || !data.units.every(isUnit)) {
      return upstreamUnavailable('invalid_payload', { status });
    }

    const buses = data.units.flatMap((unit): BusPosition[] => {
      const { id, lat, lon, online, dir } = unit;
      if (!online || lat === null || lon === null) return [];
      return [{
        id: String(id),
        lat,
        lng: lon,
        description: '112С (Томск - Северный парк)',
        direction: directionFromDestination(dir),
        bearing: bearingFromUnit(unit),
      }];
    });

    cache = { buses, fetchedAt: Date.now() };
    return buses;
  } catch (err) {
    return upstreamUnavailable('request_failed', { errorName: err instanceof Error ? err.name : undefined });
  }
}

function isServiceHours(now = new Date()): boolean {
  const tomskMin = (now.getUTCHours() * 60 + now.getUTCMinutes() + TOMSK_UTC_OFFSET_MIN) % (24 * 60);
  return tomskMin < QUIET_FROM_MIN || tomskMin >= QUIET_TO_MIN;
}

function flagEnabled(key: string): boolean {
  const flag = getDb().prepare('SELECT enabled FROM feature_flags WHERE key = ?').get(key) as
    | { enabled: number }
    | undefined;
  return flag?.enabled === 1;
}

/**
 * Фоновый опрос перевозчика в часы работы маршрута обновляет кеш позиций.
 * К перевозчику — не чаще раза в 10 с, как и их собственная страница.
 * Работает только при включённом флаге `liveDirection`; без него позиции, как и раньше,
 * запрашиваются только когда кто-то смотрит карту.
 */
export function startLivePoller(): void {
  const timer = setInterval(() => {
    try {
      if (!isServiceHours() || !flagEnabled('liveTracking') || !flagEnabled('liveDirection')) return;
      fetchLiveBuses().catch(err => logger.error({ err }, '[liveProxy] Ошибка фонового опроса'));
    } catch (err) {
      logger.error({ err }, '[liveProxy] Ошибка фонового опроса');
    }
  }, POLL_INTERVAL_MS);
  timer.unref();
}
