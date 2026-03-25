import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initDb } from './services/db';
import { healthRouter } from './routes/health';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

initDb();

app.use('/api', healthRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`severbus-backend listening on port ${PORT}`);
});
