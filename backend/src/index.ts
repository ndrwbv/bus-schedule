import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initDb } from './services/db';
import { healthRouter } from './routes/health';
import { scheduleRouter } from './routes/schedule';
import { docsRouter } from './routes/docs';
import { startScheduleCron } from './services/schedule/cron';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

initDb();
startScheduleCron();

app.use('/api', healthRouter);
app.use('/api', scheduleRouter);
app.use('/api', docsRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`severbus-backend listening on port ${PORT}`);
});
