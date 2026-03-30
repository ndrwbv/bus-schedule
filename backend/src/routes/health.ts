import { Router, Request, Response } from 'express';
import * as os from 'os';
import { getDb } from '../services/db';

export const healthRouter = Router();

const HEALTH_USER = process.env.HEALTH_USER || 'admin';
const HEALTH_PASS = process.env.HEALTH_PASS || 'severbus';

/** Basic auth middleware for /health dashboard */
function basicAuth(req: Request, res: Response, next: () => void): void {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Basic ')) {
    res.set('WWW-Authenticate', 'Basic realm="Monitoring"');
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const decoded = Buffer.from(auth.slice(6), 'base64').toString();
  const [user, pass] = decoded.split(':');

  if (user !== HEALTH_USER || pass !== HEALTH_PASS) {
    res.status(403).json({ error: 'Invalid credentials' });
    return;
  }

  next();
}

/** GET /api/health — monitoring dashboard (password protected) */
healthRouter.get('/health', basicAuth, (_req: Request, res: Response) => {
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  const db = getDb();

  let dbStatus = 'ok';
  let dbSizeBytes = 0;
  try {
    db.prepare('SELECT 1').get();
    const pragma = db.prepare('PRAGMA page_count').get() as { page_count: number } | undefined;
    const pageSize = db.prepare('PRAGMA page_size').get() as { page_size: number } | undefined;
    dbSizeBytes = (pragma?.page_count ?? 0) * (pageSize?.page_size ?? 0);
  } catch {
    dbStatus = 'error';
  }

  // Schedule info
  let scheduleUpdatedAt: string | null = null;
  try {
    const row = db.prepare(
      `SELECT updated_at FROM schedule WHERE is_active = 1 ORDER BY updated_at DESC LIMIT 1`
    ).get() as { updated_at: string } | undefined;
    scheduleUpdatedAt = row?.updated_at ?? null;
  } catch { /* ignore */ }

  // User visit stats
  let visitStats = { daily: 0, weekly: 0, monthly: 0 };
  try {
    const daily = db.prepare(
      `SELECT COUNT(DISTINCT user_id) as cnt FROM visits WHERE created_at > datetime('now', '-1 day')`
    ).get() as { cnt: number };
    const weekly = db.prepare(
      `SELECT COUNT(DISTINCT user_id) as cnt FROM visits WHERE created_at > datetime('now', '-7 days')`
    ).get() as { cnt: number };
    const monthly = db.prepare(
      `SELECT COUNT(DISTINCT user_id) as cnt FROM visits WHERE created_at > datetime('now', '-30 days')`
    ).get() as { cnt: number };
    visitStats = { daily: daily.cnt, weekly: weekly.cnt, monthly: monthly.cnt };
  } catch { /* ignore */ }

  // Complaint stats
  let complainsToday = 0;
  try {
    const row = db.prepare(
      `SELECT COUNT(*) as cnt FROM complains WHERE created_at > datetime('now', '-1 day')`
    ).get() as { cnt: number };
    complainsToday = row.cnt;
  } catch { /* ignore */ }

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    server: {
      uptime: Math.round(uptime),
      memoryMb: Math.round(memoryUsage.rss / 1024 / 1024),
      heapUsedMb: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      cpuCount: os.cpus().length,
      loadAvg: os.loadavg(),
      platform: os.platform(),
      nodeVersion: process.version,
    },
    db: {
      status: dbStatus,
      sizeMb: Math.round(dbSizeBytes / 1024 / 1024 * 100) / 100,
    },
    schedule: {
      lastUpdatedAt: scheduleUpdatedAt,
    },
    visits: visitStats,
    complainsToday,
  });
});

/** POST /api/ping — track user visit (anonymous UUID) */
healthRouter.post('/ping', (req: Request, res: Response) => {
  const { user_id } = req.body as { user_id?: string };

  if (!user_id || typeof user_id !== 'string' || user_id.length > 64) {
    res.status(400).json({ error: 'valid user_id required' });
    return;
  }

  const db = getDb();

  // Deduplicate: only record 1 visit per user per hour
  const recent = db.prepare(
    `SELECT id FROM visits WHERE user_id = ? AND created_at > datetime('now', '-1 hour') LIMIT 1`
  ).get(user_id) as { id: number } | undefined;

  if (!recent) {
    db.prepare(`INSERT INTO visits (user_id) VALUES (?)`).run(user_id);
  }

  res.json({ ok: true });
});
