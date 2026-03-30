const LIVE_API_URL = 'https://service-tiv.ru/wialon/ajax.php';
const LIVE_ROUTE_IDS = (process.env.LIVE_ROUTE_IDS || '793').split(',').map(s => s.trim());
const CACHE_TTL_MS = 10_000; // 10 seconds

export interface BusPosition {
  lat: number;
  lng: number;
  description: string;
}

interface CacheEntry {
  buses: BusPosition[];
  fetchedAt: number;
}

let cache: CacheEntry | null = null;

export async function fetchLiveBuses(): Promise<BusPosition[]> {
  // Return cache if fresh
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.buses;
  }

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

    const buses: BusPosition[] = data.map(item => ({
      lat: item.y,
      lng: item.x,
      description: item.description,
    }));

    cache = { buses, fetchedAt: Date.now() };
    return buses;
  } catch (err) {
    console.error('[liveProxy] Fetch error:', err);
    return cache?.buses ?? [];
  }
}
