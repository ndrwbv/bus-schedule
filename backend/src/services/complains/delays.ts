/**
 * Crowd-sourced delays (spec 15): how late the bus usually is at a stop, according to the
 * «Приехал» marks passengers leave there.
 */

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** A mark further than this from the scheduled time is about some other trip, not a delay */
export const MIN_DELAY = -15;
export const MAX_DELAY = 40;

export const isValidTime = (time: unknown): time is string => typeof time === 'string' && TIME_RE.test(time);

const toMinutes = (time: string): number => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

/** Minutes the bus was late (negative — early), or null when the mark can't be about that trip */
export const computeDelay = (scheduledTime: string, reportedAt: string): number | null => {
  const delay = toMinutes(reportedAt) - toMinutes(scheduledTime);
  return delay >= MIN_DELAY && delay <= MAX_DELAY ? delay : null;
};

export interface DelayRow {
  stop: string;
  direction: string;
  scheduled_time: string | null;
  delay_min: number;
  user_id: string | null;
  day: string;
}

export interface DelayStat {
  stop: string;
  direction: string;
  /** null — every trip at this stop together */
  scheduledTime: string | null;
  median: number;
  /** Middle half of the marks, so the UI can say «обычно +2…+6 мин» */
  p25: number;
  p75: number;
  /** Marks after one-per-person-per-trip-per-day dedup */
  count: number;
  /** Distinct days with marks — one bad day shouldn't look like a habit */
  days: number;
}

const quantile = (sorted: number[], q: number): number => {
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return Math.round(sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo));
};

const summarize = (
  stop: string,
  direction: string,
  scheduledTime: string | null,
  rows: DelayRow[],
): DelayStat => {
  const sorted = rows.map(r => r.delay_min).sort((a, b) => a - b);
  return {
    stop,
    direction,
    scheduledTime,
    median: quantile(sorted, 0.5),
    p25: quantile(sorted, 0.25),
    p75: quantile(sorted, 0.75),
    count: sorted.length,
    days: new Set(rows.map(r => r.day)).size,
  };
};

/**
 * Per stop+direction, and per trip at that stop. One person pressing «Приехал» twice on the
 * same trip counts once — otherwise a single enthusiast would define the stop's statistics.
 */
export const aggregateDelays = (rows: DelayRow[]): DelayStat[] => {
  const seen = new Set<string>();
  const unique = rows.filter(r => {
    if (!r.user_id) return true;
    const key = `${r.user_id}|${r.stop}|${r.direction}|${r.scheduled_time}|${r.day}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const groups = new Map<string, DelayRow[]>();
  const push = (key: string, row: DelayRow): void => {
    const list = groups.get(key);
    if (list) list.push(row);
    else groups.set(key, [row]);
  };

  for (const row of unique) {
    push(`${row.stop}|${row.direction}|`, row);
    if (row.scheduled_time) push(`${row.stop}|${row.direction}|${row.scheduled_time}`, row);
  }

  return [...groups.entries()].map(([key, list]) => {
    const [stop, direction, time] = key.split('|');
    return summarize(stop, direction, time || null, list);
  });
};
