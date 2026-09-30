import { Router, Request, Response } from 'express';
import { getDb } from '../services/db';
import { aggregateDelays, computeDelay, DelayRow, isValidTime } from '../services/complains/delays';

export const complainsRouter = Router();

const VALID_TYPES = ['earlier', 'later', 'not_arrive', 'passed_by', 'arrived'] as const;
/** How far back «обычно опаздывает» looks. Old enough to collect marks, young enough to follow the carrier */
const DELAY_WINDOW_DAYS = 28;
/** Reports are kept this long so delays can build up — they used to be wiped every night */
const RETENTION_DAYS = 90;

/** Local time in Tomsk as HH:MM — reports are about the Tomsk timetable whatever the server clock says */
const nowInTomsk = (): string =>
  new Date().toLocaleTimeString('ru-RU', { timeZone: 'Asia/Tomsk', hour: '2-digit', minute: '2-digit', hour12: false });

/**
 * POST /api/complains — submit a complaint
 * Body: { stop, direction, type, user_id?, scheduled_time?, trip_index?, day_key? }
 *
 * `scheduled_time` is the timetable time of the trip the passenger means at this stop. With it an
 * «arrived» mark turns into a delay in minutes; without it (old clients) the mark is kept as is.
 */
complainsRouter.post('/complains', (req: Request, res: Response) => {
  const { stop, direction, type, user_id, scheduled_time, trip_index, day_key } = req.body as {
    stop?: string;
    direction?: string;
    type?: string;
    user_id?: string;
    scheduled_time?: unknown;
    trip_index?: unknown;
    day_key?: unknown;
  };

  if (!stop || !direction || !type) {
    res.status(400).json({ error: 'stop, direction, and type are required' });
    return;
  }

  if (!VALID_TYPES.includes(type as typeof VALID_TYPES[number])) {
    res.status(400).json({ error: `Invalid type. Must be one of: ${VALID_TYPES.join(', ')}` });
    return;
  }

  const db = getDb();

  // Rate limiting by user_id + stop (2 minutes per stop)
  if (user_id) {
    const recent = db.prepare(
      `SELECT id FROM complains WHERE user_id = ? AND stop = ? AND created_at > datetime('now', '-2 minutes') LIMIT 1`
    ).get(user_id, stop) as { id: number } | undefined;

    if (recent) {
      res.status(429).json({ error: 'Rate limit: 1 complaint per 2 minutes per stop' });
      return;
    }
  }

  const scheduledTime = isValidTime(scheduled_time) ? scheduled_time : null;
  const tripIndex = Number.isInteger(trip_index) ? (trip_index as number) : null;
  const dayKey = Number.isInteger(day_key) && (day_key as number) >= 0 && (day_key as number) <= 6 ? (day_key as number) : null;
  const delayMin = type === 'arrived' && scheduledTime ? computeDelay(scheduledTime, nowInTomsk()) : null;

  const result = db.prepare(
    `INSERT INTO complains (stop, direction, type, user_id, scheduled_time, trip_index, day_key, delay_min)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(stop, direction, type, user_id ?? null, scheduledTime, tripIndex, dayKey, delayMin);

  res.status(201).json({ id: result.lastInsertRowid, delay_min: delayMin });
});

/** Today in Tomsk (UTC+7), not «the last 24 hours» — yesterday evening's marks say nothing about this morning */
const TODAY_IN_TOMSK = `date(created_at, '+7 hours') = date('now', '+7 hours')`;

/**
 * GET /api/complains — get today's complaints
 */
complainsRouter.get('/complains', (_req: Request, res: Response) => {
  const db = getDb();

  const rows = db.prepare(
    `SELECT id, stop, direction, type, datetime(created_at, '+7 hours') as date,
            scheduled_time, trip_index, day_key, delay_min
     FROM complains
     WHERE ${TODAY_IN_TOMSK}
     ORDER BY created_at DESC
     LIMIT 300`
  ).all();

  res.json(rows);
});

/**
 * GET /api/complains/stats — aggregated complaint counts for today
 */
complainsRouter.get('/complains/stats', (_req: Request, res: Response) => {
  const db = getDb();

  const rows = db.prepare(
    `SELECT stop, direction, type, COUNT(*) as count
     FROM complains
     WHERE ${TODAY_IN_TOMSK}
     GROUP BY stop, direction, type
     ORDER BY count DESC`
  ).all();

  res.json(rows);
});

/**
 * GET /api/complains/delays — how late the bus usually is, from «Приехал» marks of the last 4 weeks.
 * One row per stop+direction (scheduledTime: null) plus one per trip at that stop.
 */
complainsRouter.get('/complains/delays', (_req: Request, res: Response) => {
  const db = getDb();

  const rows = db.prepare(
    `SELECT stop, direction, scheduled_time, delay_min, user_id, date(created_at, '+7 hours') as day
     FROM complains
     WHERE type = 'arrived' AND delay_min IS NOT NULL
       AND created_at > datetime('now', ?)`
  ).all(`-${DELAY_WINDOW_DAYS} days`) as DelayRow[];

  res.set('Cache-Control', 'public, max-age=600');
  res.json({ windowDays: DELAY_WINDOW_DAYS, stats: aggregateDelays(rows) });
});

/**
 * Cleanup: delete complaints older than RETENTION_DAYS (called by cron)
 */
export function cleanupOldComplains(): void {
  const db = getDb();
  const result = db.prepare(`DELETE FROM complains WHERE created_at < datetime('now', ?)`).run(`-${RETENTION_DAYS} days`);
  if (result.changes > 0) {
    console.log(`[complains] Очистка: удалено ${result.changes} жалоб`);
  }
}
