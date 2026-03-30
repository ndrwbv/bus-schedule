import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initDb } from './services/db';
import { healthRouter } from './routes/health';
import { scheduleRouter } from './routes/schedule';
import { complainsRouter } from './routes/complains';
import { docsRouter } from './routes/docs';
import { featuresRouter } from './routes/features';
import { liveRouter } from './routes/live';
import { startScheduleCron } from './services/schedule/cron';
import { initTelegramSubscribers, pollSubscribers } from './services/telegram/alerter';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

initDb();
initTelegramSubscribers();
pollSubscribers().catch((err) => console.error('[telegram] Ошибка первичного опроса:', err));
startScheduleCron();

app.use('/api', healthRouter);
app.use('/api', scheduleRouter);
app.use('/api', complainsRouter);
app.use('/api', featuresRouter);
app.use('/api', liveRouter);
app.use('/api', docsRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`severbus-backend listening on port ${PORT}`);
});
