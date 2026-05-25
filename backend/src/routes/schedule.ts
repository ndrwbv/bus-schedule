import crypto from 'crypto'
import { Router, Request, Response } from 'express'
import multer from 'multer'
import { getDb } from '../services/db'
import {
  buildDiff,
  countStops,
  countTrips,
  runPipeline,
  summarizeDiff,
} from '../services/schedule/pipeline'
import { telegramAlerter } from '../services/telegram/alerter'
import { ISchedule, ScheduleRecord } from '../services/schedule/types'
import { validateSchedule } from '../services/schedule/validator'

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

    // Последняя успешная проверка (cron или api)
    const lastRun = db
      .prepare(
        `SELECT created_at FROM schedule_pipeline_runs
         WHERE status IN ('success', 'no_changes')
         ORDER BY created_at DESC LIMIT 1`,
      )
      .get() as { created_at: string } | undefined

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
        lastCheckedAt: lastRun?.created_at ?? row.updated_at,
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
    if (!adminToken) {
      res.status(500).json({ error: 'config_error', message: 'ADMIN_TOKEN не настроен на сервере' })
      return
    }
    const auth = req.headers.authorization ?? ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
    if (token !== adminToken) {
      res.status(401).json({ error: 'unauthorized', message: 'Неверный или отсутствующий токен' })
      return
    }

    const { url, force, sync } = req.body as { url?: string; force?: string | boolean; sync?: string | boolean }
    const fileBuffer = req.file?.buffer
    const isForce = force === true || force === 'true'
    const isSync = sync === true || sync === 'true'

    const pipelineOpts = { trigger: 'api' as const, url, force: isForce, fileBuffer }

    // File uploads run synchronously (fast, no browser needed)
    // URL/scrape requests run in background by default (Puppeteer is slow)
    if (fileBuffer || isSync) {
      try {
        const result = await runPipeline(pipelineOpts)

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
    } else {
      // Run pipeline in background to avoid nginx 504 timeout
      res.json({ status: 'accepted', message: 'Обновление запущено в фоне. Результат в /api/schedule/refresh/status' })
      runPipeline(pipelineOpts).then((result) => {
        console.log(`[pipeline] Фоновый запуск завершён: ${result.status}`, result.error ?? '')
      }).catch((err) => {
        console.error('[pipeline] Фоновый запуск упал:', err)
      })
    }
  },
)

// ─── POST /api/schedule/refresh-json ──────────────────────────────────────────
// Ручная загрузка расписания готовым JSON. Используется, когда перевозчик
// публикует расписание не Word-документом (тогда работает /refresh), а в виде
// картинок — оператор парсит вручную/через LLM и POST'ит результат сюда.
// parse_method = 'manual_json'.

scheduleRouter.post('/schedule/refresh-json', (req: Request, res: Response) => {
  const adminToken = process.env.ADMIN_TOKEN
  if (!adminToken) {
    res.status(500).json({ error: 'config_error', message: 'ADMIN_TOKEN не настроен на сервере' })
    return
  }
  const auth = req.headers.authorization ?? ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (token !== adminToken) {
    res.status(401).json({ error: 'unauthorized', message: 'Неверный или отсутствующий токен' })
    return
  }

  const body = (req.body ?? {}) as { schedule?: ISchedule; force?: boolean | string; note?: string }
  const newSchedule = body.schedule
  const isForce = body.force === true || body.force === 'true'
  const note = typeof body.note === 'string' ? body.note.slice(0, 200) : null

  if (!newSchedule || typeof newSchedule !== 'object') {
    res.status(400).json({ error: 'bad_request', message: 'Ожидается поле schedule с объектом ISchedule' })
    return
  }

  const db = getDb()
  const startMs = Date.now()

  // Регистрируем pipeline run (чтобы попало в /refresh/status и в общий мониторинг)
  const runId = (
    db.prepare(`INSERT INTO schedule_pipeline_runs (trigger, status) VALUES ('api', 'running')`).run()
  ).lastInsertRowid as number

  const finishRun = (status: string, opts: { error?: string; stage?: string; parseMethod?: string; fileHash?: string }) => {
    db.prepare(
      `UPDATE schedule_pipeline_runs
       SET status = ?, error_message = ?, error_stage = ?, parse_method = ?, file_hash = ?, duration_ms = ?
       WHERE id = ?`,
    ).run(
      status,
      opts.error ?? null,
      opts.stage ?? null,
      opts.parseMethod ?? null,
      opts.fileHash ?? null,
      Date.now() - startMs,
      runId,
    )
  }

  try {
    // Canonical hash: стабильный JSON (сорт ключей рекурсивно).
    const canonical = canonicalStringify(newSchedule)
    const hash = crypto.createHash('sha256').update(canonical).digest('hex')

    const currentRow = db
      .prepare(`SELECT data, file_hash FROM schedule WHERE is_active = 1 LIMIT 1`)
      .get() as { data: string; file_hash: string } | undefined

    if (!isForce && currentRow?.file_hash === hash) {
      finishRun('no_changes', { fileHash: hash, parseMethod: 'manual_json' })
      res.json({ status: 'no_changes', fileHash: hash, message: 'Расписание актуально (хеш совпал)' })
      return
    }

    // Валидация формата + порог изменений (если current есть и не force).
    const currentSchedule = currentRow ? (JSON.parse(currentRow.data) as ISchedule) : undefined
    const threshold = parseFloat(process.env.VALIDATION_CHANGE_THRESHOLD ?? '0.5')
    const validation = validateSchedule(newSchedule, isForce ? undefined : currentSchedule, threshold)

    if (!validation.ok) {
      const details = validation.errors.join('; ')
      finishRun('error', { error: details, stage: 'validate', fileHash: hash, parseMethod: 'manual_json' })
      telegramAlerter.validationError(details).catch(() => undefined)
      res.status(422).json({
        error: 'validation_failed',
        message: 'Валидация не прошла',
        details,
        hint: isForce ? undefined : 'Если изменения масштабные (новый формат от перевозчика) — переотправь с force=true',
      })
      return
    }

    const stopsCount = countStops(newSchedule)
    const tripsCount = countTrips(newSchedule)
    const diff = currentSchedule ? buildDiff(currentSchedule, newSchedule) : null
    const summary = (note ? `${note}. ` : '') + (diff ? summarizeDiff(diff) : 'Первое сохранение расписания')

    db.transaction(() => {
      db.prepare(`UPDATE schedule SET is_active = 0 WHERE is_active = 1`).run()
      const newRow = db
        .prepare(
          `INSERT INTO schedule (data, file_hash, parse_method, file_type, stops_count, trips_count, is_active)
           VALUES (?, ?, 'manual_json', 'json', ?, ?, 1)`,
        )
        .run(canonical, hash, stopsCount, tripsCount)

      if (diff) {
        db.prepare(
          `INSERT INTO schedule_changelog (schedule_id, diff, summary, parse_method, previous_hash, new_hash)
           VALUES (?, ?, ?, 'manual_json', ?, ?)`,
        ).run(
          newRow.lastInsertRowid,
          JSON.stringify(diff),
          summary,
          currentRow ? currentRow.file_hash : null,
          hash,
        )
      }
    })()

    const durationMs = Date.now() - startMs
    finishRun('success', { fileHash: hash, parseMethod: 'manual_json' })
    telegramAlerter.scheduleUpdated(summary, 'manual_json', durationMs).catch(() => undefined)

    res.json({
      status: 'updated',
      parseMethod: 'manual_json',
      fileHash: hash,
      stopsCount,
      tripsCount,
      changesSummary: summary,
      durationMs,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    finishRun('error', { error: msg, stage: 'save', parseMethod: 'manual_json' })
    console.error('POST /schedule/refresh-json error:', err)
    res.status(500).json({ error: 'internal_error', message: msg })
  }
})

function canonicalStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return '[' + value.map(canonicalStringify).join(',') + ']'
  }
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>
    const keys = Object.keys(obj).sort()
    return '{' + keys.map((k) => JSON.stringify(k) + ':' + canonicalStringify(obj[k])).join(',') + '}'
  }
  return JSON.stringify(value)
}

// ─── GET /api/schedule/refresh/status ─────────────────────────────────────────

scheduleRouter.get('/schedule/refresh/status', (req: Request, res: Response) => {
  const adminToken = process.env.ADMIN_TOKEN
  const auth = req.headers.authorization ?? ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (!adminToken || token !== adminToken) {
    res.status(401).json({ error: 'unauthorized' })
    return
  }

  const db = getDb()
  const lastRun = db
    .prepare(
      `SELECT id, trigger, status, error_message, error_stage, parse_method, file_hash, duration_ms, created_at
       FROM schedule_pipeline_runs ORDER BY id DESC LIMIT 1`,
    )
    .get()

  if (!lastRun) {
    res.json({ status: 'no_runs', message: 'Пайплайн ещё не запускался' })
    return
  }

  res.json(lastRun)
})

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
