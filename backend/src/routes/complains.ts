import { Router, Request, Response } from 'express';
import { getDb } from '../services/db';

export const complainsRouter = Router();

const VALID_TYPES = ['earlier', 'later', 'not_arrive', 'passed_by', 'arrived'] as const;
const RATE_LIMIT_MS = 2 * 60_000; // 2 minutes

/**
 * POST /api/complains — submit a complaint
 * Body: { stop_id, direction, type, user_id? }
 */
complainsRouter.post('/complains', (req: Request, res: Response) => {
  try {
    const { stop_id, direction, type, user_id } = req.body as {
      stop_id?: string;
      direction?: string;
      type?: string;
      user_id?: string;
    };

    if (!stop_id || !direction || !type) {
      res.status(400).json({ error: 'stop_id, direction, and type are required' });
      return;
    }

    if (!VALID_TYPES.includes(type as typeof VALID_TYPES[number])) {
      res.status(400).json({ error: `Invalid type. Must be one of: ${VALID_TYPES.join(', ')}` });
      return;
    }

    const db = getDb();

    if (user_id) {
      const recent = db.prepare(
        `SELECT id FROM complains WHERE user_id = ? AND stop_id = ? AND created_at > datetime('now', '-2 minutes') LIMIT 1`
      ).get(user_id, stop_id) as { id: number } | undefined;

      if (recent) {
        res.status(429).json({ error: 'Rate limit: 1 complaint per 2 minutes per stop' });
        return;
      }
    }

    const result = db.prepare(
      `INSERT INTO complains (stop_id, direction, type, user_id) VALUES (?, ?, ?, ?)`
    ).run(stop_id, direction, type, user_id ?? null);

    res.status(201).json({ id: result.lastInsertRowid });
  } catch (err) {
    console.error('[complains] POST error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/complains — get today's complaints
 */
complainsRouter.get('/complains', (_req: Request, res: Response) => {
  try {
    const db = getDb();

    const rows = db.prepare(
      `SELECT id, stop_id, direction, type, datetime(created_at, '+7 hours') as date
       FROM complains
       WHERE created_at > datetime('now', '-1 day')
       ORDER BY created_at DESC
       LIMIT 100`
    ).all();

    res.json(rows);
  } catch (err) {
    console.error('[complains] GET error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/complains/stats — aggregated complaint counts for today
 */
complainsRouter.get('/complains/stats', (_req: Request, res: Response) => {
  try {
    const db = getDb();

    const rows = db.prepare(
      `SELECT stop_id, direction, type, COUNT(*) as count
       FROM complains
       WHERE created_at > datetime('now', '-1 day')
       GROUP BY stop_id, direction, type
       ORDER BY count DESC`
    ).all();

    res.json(rows);
  } catch (err) {
    console.error('[complains] stats error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Cleanup: delete all complaints (called by cron daily)
 */
export function cleanupOldComplains(): void {
  const db = getDb();
  const result = db.prepare(`DELETE FROM complains`).run();
  if (result.changes > 0) {
    console.log(`[complains] Очистка: удалено ${result.changes} жалоб`);
  }
}
