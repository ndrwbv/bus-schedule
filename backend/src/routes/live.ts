import { Router, Request, Response } from 'express';
import { getDb } from '../services/db';
import { fetchLiveBuses, MAIN_LIVE_ROUTE } from '../services/liveProxy';

export const liveRouter = Router();

/** GET /api/live — live bus positions (proxied from upstream) */
liveRouter.get('/live', async (req: Request, res: Response) => {
  try {
    // Check feature flag
    const db = getDb();
    const flag = db.prepare('SELECT enabled FROM feature_flags WHERE key = ?').get('liveTracking') as { enabled: number } | undefined;

    if (!flag || flag.enabled !== 1) {
      res.status(404).json({ error: 'Feature disabled' });
      return;
    }

    const buses = await fetchLiveBuses();
    const visibleBuses = req.query.routes === 'all'
      ? buses
      : buses.filter(bus => bus.route === MAIN_LIVE_ROUTE);

    res.set('Cache-Control', 'no-cache');
    res.json({ buses: visibleBuses, cachedAt: Date.now() });
  } catch (err) {
    console.error('[live] Error:', err);
    res.status(503).json({ error: 'Данные временно недоступны', buses: [] });
  }
});
