import { Router, Request, Response } from 'express'
import multer from 'multer'
import { getDb } from '../services/db'
import { runPipeline } from '../services/schedule/pipeline'
import { ScheduleRecord } from '../services/schedule/types'

export const scheduleRouter = Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })

// ─── GET /api/schedule ────────────────────────────────────────────────────────

scheduleRouter.get('/schedule', (_req: Request, res: Response) => {
  try {
    const db = getDb()
    const row = db
      .prepare(`SELECT * FROM schedule WHERE is_active = 1 LIMIT 1`)
      .get() as ScheduleRecord | undefined

    if (!row) {
      res.status(500).json({ error: 'internal_error', message: 'Не удалось получить расписание' })
      return
    }

    const etag = `"${row.file_hash}"`

    // Conditional request support
    if (_req.headers['if-none-match'] === etag) {
      res.status(304).end()
      return
    }

    res.set({
      'Cache-Control': 'public, max-age=3600',
      ETag: etag,
    })

    res.json({
      schedule: JSON.parse(row.data),
      meta: {
        updatedAt: row.updated_at,
        parseMethod: row.parse_method,
        fileHash: row.file_hash,
      },
    })
  } catch (err) {
    console.error('GET /schedule error:', err)
    res.status(500).json({ error: 'internal_error', message: 'Не удалось получить расписание' })
  }
})

// ─── POST /api/schedule/refresh ───────────────────────────────────────────────

scheduleRouter.post(
  '/schedule/refresh',
  upload.single('file'),
  async (req: Request, res: Response) => {
    // Auth
    const adminToken = process.env.ADMIN_TOKEN
    if (adminToken) {
      const auth = req.headers.authorization ?? ''
      const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
      if (token !== adminToken) {
        res.status(401).json({ error: 'unauthorized', message: 'Неверный или отсутствующий токен' })
        return
      }
    }

    const { url, force } = req.body as { url?: string; force?: boolean }
    const fileBuffer = req.file?.buffer

    try {
      const result = await runPipeline({
        trigger: 'api',
        url,
        force: Boolean(force),
        fileBuffer,
      })

      if (result.status === 'error') {
        res.status(422).json({
          error: 'validation_failed',
          message: 'Парсинг не прошёл валидацию',
          details: result.error,
          errorStage: result.errorStage,
        })
        return
      }

      if (result.status === 'no_changes') {
        res.json({
          status: 'no_changes',
          fileHash: result.fileHash,
          message: 'Расписание актуально',
        })
        return
      }

      res.json({
        status: 'updated',
        parseMethod: result.parseMethod,
        fileHash: result.fileHash,
        stopsCount: result.stopsCount,
        tripsCount: result.tripsCount,
        changesSummary: result.changesSummary,
        durationMs: result.durationMs,
      })
    } catch (err) {
      console.error('POST /schedule/refresh error:', err)
      res.status(500).json({ error: 'internal_error', message: String(err) })
    }
  },
)

// ─── GET /api/schedule/changelog ──────────────────────────────────────────────

scheduleRouter.get('/schedule/changelog', (req: Request, res: Response) => {
  try {
    const db = getDb()
    const limit = Math.min(parseInt((req.query.limit as string) ?? '10', 10), 50)
    const offset = parseInt((req.query.offset as string) ?? '0', 10)

    const items = db
      .prepare(
        `SELECT id, created_at as createdAt, summary, parse_method as parseMethod, diff
         FROM schedule_changelog ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      )
      .all(limit, offset) as Array<{ id: number; createdAt: string; summary: string; parseMethod: string; diff: string }>

    const total = (
      db.prepare('SELECT COUNT(*) as cnt FROM schedule_changelog').get() as { cnt: number }
    ).cnt

    res.json({
      items: items.map((item) => ({ ...item, diff: JSON.parse(item.diff) })),
      total,
      limit,
      offset,
    })
  } catch (err) {
    console.error('GET /schedule/changelog error:', err)
    res.status(500).json({ error: 'internal_error', message: 'Не удалось получить ченжлог' })
  }
})
