import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initDb } from './services/db';
import { logger } from './services/logger';
import { requestLogger, errorHandler } from './middleware/requestLogger';
import { healthRouter } from './routes/health';
import { scheduleRouter } from './routes/schedule';
import { complainsRouter } from './routes/complains';
import { docsRouter } from './routes/docs';
import { featuresRouter } from './routes/features';
import { liveRouter } from './routes/live';
import { logsRouter } from './routes/logs';
import { bannerMessagesRouter } from './routes/bannerMessages';
import { startScheduleCron } from './services/schedule/cron';
import { startComplainsCron } from './services/complains/cron';
import { startLogsCron } from './services/logs/cron';
import { initTelegramSubscribers, pollSubscribers } from './services/telegram/alerter';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(requestLogger);

initDb();
initTelegramSubscribers();
pollSubscribers().catch((err) => logger.error({ err }, '[telegram] Ошибка первичного опроса'));
startScheduleCron();
startComplainsCron();
startLogsCron();

app.use('/api', healthRouter);
app.use('/api', scheduleRouter);
app.use('/api', complainsRouter);
app.use('/api', featuresRouter);
app.use('/api', liveRouter);
app.use('/api', logsRouter);
app.use('/api', bannerMessagesRouter);
app.use('/api', docsRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Global error handler — must be after all routes
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`severbus-backend listening on port ${PORT}`);
});
