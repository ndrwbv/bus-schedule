import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { initDb } from './services/db';
import { healthRouter } from './routes/health';
import { scheduleRouter } from './routes/schedule';
import { complainsRouter } from './routes/complains';
import { docsRouter } from './routes/docs';
import { featuresRouter } from './routes/features';
import { liveRouter } from './routes/live';
import { startScheduleCron } from './services/schedule/cron';
import { startComplainsCron } from './services/complains/cron';
import { initTelegramSubscribers, pollSubscribers, startTelegramPolling } from './services/telegram/alerter';
import { recordError } from './services/errorTracker';
import { telegramAlerter } from './services/telegram/alerter';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

initDb();
initTelegramSubscribers();
pollSubscribers().catch((err) => console.error('[telegram] Ошибка первичного опроса:', err));
startScheduleCron();
startComplainsCron();
startTelegramPolling();

app.use('/api', healthRouter);
app.use('/api', scheduleRouter);
app.use('/api', complainsRouter);
app.use('/api', featuresRouter);
app.use('/api', liveRouter);
app.use('/api', docsRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Global error handler — track 500s and alert via Telegram
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  const message = err.message || 'Unknown error';
  console.error(`[500] ${req.method} ${req.path}:`, err);

  recordError(req.method, req.path, message);
  telegramAlerter.serverError(req.method, req.path, message).catch(() => {});

  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`severbus-backend listening on port ${PORT}`);
});
