import { Router, Request, Response } from 'express';
import { getDb } from '../services/db';

export const bannerMessagesRouter = Router();

const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

/** GET /api/banner-messages — public, returns approved messages */
bannerMessagesRouter.get('/banner-messages', (_req: Request, res: Response) => {
  try {
    const db = getDb();
    const rows = db
      .prepare(
        `SELECT id, author_name, message, created_at
         FROM banner_messages
         WHERE is_approved = 1
         ORDER BY created_at DESC`
      )
      .all();

    res.json({ messages: rows });
  } catch (err) {
    console.error('[banner-messages] Error reading:', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

/** POST /api/banner-messages — admin only, add a message */
bannerMessagesRouter.post('/banner-messages', (req: Request, res: Response) => {
  if (!ADMIN_TOKEN) {
    res.status(500).json({ error: 'config_error', message: 'ADMIN_TOKEN не настроен на сервере' });
    return;
  }

  const auth = req.headers.authorization;
  if (!auth || auth !== `Bearer ${ADMIN_TOKEN}`) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { author_name, message, is_approved } = req.body as {
    author_name?: string;
    message?: string;
    is_approved?: boolean;
  };

  if (!author_name || !message) {
    res.status(400).json({ error: 'Bad request', message: 'author_name and message are required' });
    return;
  }

  try {
    const db = getDb();
    const result = db
      .prepare(
        `INSERT INTO banner_messages (author_name, message, is_approved)
         VALUES (?, ?, ?)`
      )
      .run(author_name, message, is_approved !== false ? 1 : 0);

    res.status(201).json({ id: result.lastInsertRowid, author_name, message, is_approved: is_approved !== false });
  } catch (err) {
    console.error('[banner-messages] Error creating:', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

/** DELETE /api/banner-messages/:id — admin only */
bannerMessagesRouter.delete('/banner-messages/:id', (req: Request, res: Response) => {
  if (!ADMIN_TOKEN) {
    res.status(500).json({ error: 'config_error', message: 'ADMIN_TOKEN не настроен на сервере' });
    return;
  }

  const auth = req.headers.authorization;
  if (!auth || auth !== `Bearer ${ADMIN_TOKEN}`) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const db = getDb();
    const result = db.prepare('DELETE FROM banner_messages WHERE id = ?').run(req.params.id);

    if (result.changes === 0) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('[banner-messages] Error deleting:', err);
    res.status(500).json({ error: 'Internal error' });
  }
});
