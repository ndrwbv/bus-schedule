import { getDb } from './db';
import { logger } from './logger';
import { liveTracker, TrackedBus } from './live/tracker';

const LIVE_API_URL = 'https://service-tiv.ru/wialon/ajax.php';
const LIVE_ROUTE_IDS = (process.env.LIVE_ROUTE_IDS || '794').split(',').map(s => s.trim());
// Чуть меньше интервала фонового опроса, чтобы каждый тик поллера доходил до перевозчика
const CACHE_TTL_MS = 9_000;
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

let cache: CacheEntry | null = null;
/** Запрос к перевозчику в полёте — поллер и пользователи не дублируют его */
let inFlight: Promise<BusPosition[]> | null = null;

export async function fetchLiveBuses(): Promise<BusPosition[]> {
  // Return cache if fresh
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.buses;
  }

  inFlight ??= fetchUpstream().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

async function fetchUpstream(): Promise<BusPosition[]> {
  try {
    const body = LIVE_ROUTE_IDS.map(id => `ids%5B%5D=${id}`).join('&');

    const response = await fetch(LIVE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Origin': 'https://service-tiv.ru',
        'Referer': 'https://service-tiv.ru/wialon/',
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      body,
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      console.error(`[liveProxy] Upstream returned ${response.status}`);
      return cache?.buses ?? [];
    }

    const data = await response.json() as { x: number; y: number; description: string; icon: string }[];

    // Трекер добавляет стабильный id, направление и курс (specs/14-live-bus-direction.md)
    const buses = liveTracker.ingest(
      data.map(item => ({ lat: item.y, lng: item.x, description: item.description })),
    );

    cache = { buses, fetchedAt: Date.now() };
    return buses;
  } catch (err) {
    console.error('[liveProxy] Fetch error:', err);
    return cache?.buses ?? [];
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
 * Фоновый опрос перевозчика в часы работы маршрута: направление считается по истории
 * позиций, а без фона история копилась бы только пока кто-то смотрит карту.
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
