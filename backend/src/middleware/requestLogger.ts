import { Request, Response, NextFunction } from 'express';
import { logger } from '../services/logger';
import { getDb } from '../services/db';

/** Persist a log entry to SQLite */
function saveLog(entry: {
  level: string;
  method: string;
  url: string;
  statusCode: number;
  durationMs: number;
  errorMessage?: string;
  errorStack?: string;
  userAgent?: string;
  ip?: string;
}): void {
  try {
    const db = getDb();
    db.prepare(
      `INSERT INTO request_logs (level, method, url, status_code, duration_ms, error_message, error_stack, user_agent, ip)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      entry.level,
      entry.method,
      entry.url,
      entry.statusCode,
      entry.durationMs,
      entry.errorMessage ?? null,
      entry.errorStack ?? null,
      entry.userAgent ?? null,
      entry.ip ?? null,
    );
  } catch (err) {
    logger.error({ err }, 'Failed to save request log to DB');
  }
}

/** Middleware: logs every request and persists 4xx/5xx to SQLite */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const origEnd: typeof res.end = res.end.bind(res);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (res as any).end = function (...args: any[]) {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const method = req.method;
    const url = req.originalUrl;
    const userAgent = req.headers['user-agent'];
    const ip = req.ip || req.headers['x-forwarded-for'] as string || '';

    const logData = { method, url, statusCode, duration, userAgent };

    if (statusCode >= 500) {
      logger.error(logData, `${method} ${url} ${statusCode} ${duration}ms`);
      saveLog({
        level: 'error',
        method,
        url,
        statusCode,
        durationMs: duration,
        errorMessage: (res as any).__errorMessage,
        errorStack: (res as any).__errorStack,
        userAgent,
        ip,
      });
    } else if (statusCode >= 400) {
      logger.warn(logData, `${method} ${url} ${statusCode} ${duration}ms`);
      saveLog({
        level: 'warn',
        method,
        url,
        statusCode,
        durationMs: duration,
        errorMessage: (res as any).__errorMessage,
        userAgent,
        ip,
      });
    } else {
      logger.info(logData, `${method} ${url} ${statusCode} ${duration}ms`);
    }

    return origEnd.apply(res, args as any);
  };

  next();
}

/** Global error handler: catches unhandled errors in route handlers */
export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  const duration = 0;
  const method = req.method;
  const url = req.originalUrl;
  const userAgent = req.headers['user-agent'];
  const ip = req.ip || req.headers['x-forwarded-for'] as string || '';

  logger.error(
    { err, method, url },
    `Unhandled error: ${method} ${url} — ${err.message}`,
  );

  saveLog({
    level: 'error',
    method,
    url,
    statusCode: 500,
    durationMs: duration,
    errorMessage: err.message,
    errorStack: err.stack,
    userAgent,
    ip,
  });

  if (!res.headersSent) {
    res.status(500).json({ error: 'Internal server error' });
  }
}
