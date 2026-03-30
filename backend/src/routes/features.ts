import { Router, Request, Response } from 'express';
import { getDb } from '../services/db';

export const featuresRouter = Router();

const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

/** GET /api/features — public, returns all feature flags */
featuresRouter.get('/features', (_req: Request, res: Response) => {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT key, enabled FROM feature_flags').all() as { key: string; enabled: number }[];

    const flags: Record<string, boolean> = {};
    for (const row of rows) {
      flags[row.key] = row.enabled === 1;
    }

    res.json(flags);
  } catch (err) {
    console.error('[features] Error reading flags:', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

/** PUT /api/features/:flag — admin only, toggle a feature flag */
featuresRouter.put('/features/:flag', (req: Request, res: Response) => {
  if (!ADMIN_TOKEN) {
    res.status(500).json({ error: 'config_error', message: 'ADMIN_TOKEN не настроен на сервере' });
    return;
  }

  const auth = req.headers.authorization;
  if (!auth || auth !== `Bearer ${ADMIN_TOKEN}`) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const flag = req.params.flag as string;
  const { enabled } = req.body as { enabled?: boolean };

  if (typeof enabled !== 'boolean') {
    res.status(400).json({ error: 'Bad request', message: 'Body must contain { enabled: boolean }' });
    return;
  }

  try {
    const db = getDb();
    const result = db.prepare(
      `INSERT INTO feature_flags (key, enabled, updated_at) VALUES (?, ?, datetime('now'))
       ON CONFLICT(key) DO UPDATE SET enabled = excluded.enabled, updated_at = datetime('now')`
    ).run(flag, enabled ? 1 : 0);

    console.log(`[features] Flag "${flag}" set to ${enabled} (changes: ${result.changes})`);
    const response: Record<string, boolean> = {};
    response[flag] = enabled;
    res.json(response);
  } catch (err) {
    console.error('[features] Error updating flag:', err);
    res.status(500).json({ error: 'Internal error' });
  }
});
