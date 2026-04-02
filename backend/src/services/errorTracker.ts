/** In-memory 500 error counter with per-hour buckets */

interface ErrorEntry {
  timestamp: number;
  method: string;
  path: string;
  message: string;
}

const errors: ErrorEntry[] = [];
const MAX_ENTRIES = 500;

export function recordError(method: string, path: string, message: string): void {
  errors.push({ timestamp: Date.now(), method, path, message });
  if (errors.length > MAX_ENTRIES) {
    errors.splice(0, errors.length - MAX_ENTRIES);
  }
}

export function getErrorStats(): { total: number; lastHour: number; last24h: number; recent: ErrorEntry[] } {
  const now = Date.now();
  const hourAgo = now - 60 * 60 * 1000;
  const dayAgo = now - 24 * 60 * 60 * 1000;

  const lastHour = errors.filter(e => e.timestamp > hourAgo).length;
  const last24h = errors.filter(e => e.timestamp > dayAgo).length;
  const recent = errors.slice(-5).reverse();

  return { total: errors.length, lastHour, last24h, recent };
}
