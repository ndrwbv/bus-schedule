import { Router, Request, Response } from 'express';
import { getDb } from '../services/db';

export const featuresRouter = Router();

const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

/** All known feature flags with defaults */
const FEATURE_DEFAULTS: Record<string, boolean> = {
  liveTracking: true,
};

/** GET /api/features — public, returns all feature flags */
featuresRouter.get('/features', (_req: Request, res: Response) => {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT key, enabled FROM feature_flags').all() as { key: string; enabled: number }[];

    const flags: Record<string, boolean> = { ...FEATURE_DEFAULTS };
    for (const row of rows) {
      if (row.key in flags) {
        flags[row.key] = row.enabled === 1;
      }
    }

    res.json(flags);
  } catch (err) {
    console.error('[features] Error reading flags:', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

/** PUT /api/features — admin only, update feature flags */
featuresRouter.put('/features', (req: Request, res: Response) => {
  if (!ADMIN_TOKEN) {
    res.status(500).json({ error: 'config_error', message: 'ADMIN_TOKEN не настроен на сервере' });
    return;
  }

  const auth = req.headers.authorization;
  if (!auth || auth !== `Bearer ${ADMIN_TOKEN}`) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const body = req.body as Record<string, unknown>;
  const updates: Record<string, boolean> = {};

  for (const [key, value] of Object.entries(body)) {
    if (!(key in FEATURE_DEFAULTS)) {
      res.status(400).json({ error: 'Bad request', message: `Unknown flag: ${key}` });
      return;
    }
    if (typeof value !== 'boolean') {
      res.status(400).json({ error: 'Bad request', message: `Flag "${key}" must be boolean` });
      return;
    }
    updates[key] = value;
  }

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: 'Bad request', message: 'Body must contain at least one flag' });
    return;
  }

  try {
    const db = getDb();
    const stmt = db.prepare(
      `INSERT INTO feature_flags (key, enabled, updated_at) VALUES (?, ?, datetime('now'))
       ON CONFLICT(key) DO UPDATE SET enabled = excluded.enabled, updated_at = datetime('now')`
    );

    const upsertMany = db.transaction((entries: [string, boolean][]) => {
      for (const [key, enabled] of entries) {
        stmt.run(key, enabled ? 1 : 0);
      }
    });

    upsertMany(Object.entries(updates));
    console.log(`[features] Updated:`, updates);

    // Return full state after update
    const rows = db.prepare('SELECT key, enabled FROM feature_flags').all() as { key: string; enabled: number }[];
    const flags: Record<string, boolean> = { ...FEATURE_DEFAULTS };
    for (const row of rows) {
      if (row.key in flags) {
        flags[row.key] = row.enabled === 1;
      }
    }

    res.json(flags);
  } catch (err) {
    console.error('[features] Error updating flags:', err);
    res.status(500).json({ error: 'Internal error' });
  }
});
