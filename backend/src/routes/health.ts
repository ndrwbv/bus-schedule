import { Router } from 'express';
import { getDb } from '../services/db';

export const healthRouter = Router();

healthRouter.get('/health', (_req, res) => {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();

  let dbStatus = 'ok';
  try {
    getDb().prepare('SELECT 1').get();
  } catch {
    dbStatus = 'error';
  }

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.round(uptime),
    memoryMb: Math.round(memoryUsage.rss / 1024 / 1024),
    db: dbStatus,
  });
});
