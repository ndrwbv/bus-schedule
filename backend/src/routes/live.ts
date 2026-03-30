import { Router, Request, Response } from 'express';
import { getDb } from '../services/db';
import { fetchLiveBuses } from '../services/liveProxy';

export const liveRouter = Router();

/** GET /api/live — live bus positions (proxied from upstream) */
liveRouter.get('/live', async (_req: Request, res: Response) => {
  try {
    // Check feature flag
    const db = getDb();
    const flag = db.prepare('SELECT enabled FROM feature_flags WHERE key = ?').get('liveTracking') as { enabled: number } | undefined;

    if (!flag || flag.enabled !== 1) {
      res.status(404).json({ error: 'Feature disabled' });
      return;
    }

    const buses = await fetchLiveBuses();

    res.set('Cache-Control', 'no-cache');
    res.json({ buses, cachedAt: Date.now() });
  } catch (err) {
    console.error('[live] Error:', err);
    res.status(503).json({ error: 'Данные временно недоступны', buses: [] });
  }
});
