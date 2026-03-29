import { Router, Request, Response } from 'express';
import { getDb } from '../services/db';

export const complainsRouter = Router();

const VALID_TYPES = ['earlier', 'later', 'not_arrive', 'passed_by', 'arrived'] as const;
const RATE_LIMIT_MS = 60_000; // 1 minute

/**
 * POST /api/complains — submit a complaint
 * Body: { stop, direction, type, user_id? }
 */
complainsRouter.post('/complains', (req: Request, res: Response) => {
  const { stop, direction, type, user_id } = req.body as {
    stop?: string;
    direction?: string;
    type?: string;
    user_id?: string;
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

  // Rate limiting by user_id
  if (user_id) {
    const recent = db.prepare(
      `SELECT id FROM complains WHERE user_id = ? AND created_at > datetime('now', '-1 minute') LIMIT 1`
    ).get(user_id) as { id: number } | undefined;

    if (recent) {
      res.status(429).json({ error: 'Rate limit: 1 complaint per minute' });
      return;
    }
  }

  const result = db.prepare(
    `INSERT INTO complains (stop, direction, type, user_id) VALUES (?, ?, ?, ?)`
  ).run(stop, direction, type, user_id ?? null);

  res.status(201).json({ id: result.lastInsertRowid });
});

/**
 * GET /api/complains — get today's complaints
 */
complainsRouter.get('/complains', (_req: Request, res: Response) => {
  const db = getDb();

  const rows = db.prepare(
    `SELECT id, stop, direction, type, created_at as date
     FROM complains
     WHERE created_at > datetime('now', '-1 day')
     ORDER BY created_at DESC
     LIMIT 100`
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
     WHERE created_at > datetime('now', '-1 day')
     GROUP BY stop, direction, type
     ORDER BY count DESC`
  ).all();

  res.json(rows);
});

/**
 * Cleanup: delete complaints older than 1 day (called by cron)
 */
export function cleanupOldComplains(): void {
  const db = getDb();
  const result = db.prepare(
    `DELETE FROM complains WHERE created_at < datetime('now', '-1 day')`
  ).run();
  if (result.changes > 0) {
    console.log(`[complains] Cleaned up ${result.changes} old complaints`);
  }
}
