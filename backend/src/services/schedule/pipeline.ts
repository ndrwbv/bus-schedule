import { getDb } from '../db'
import { scrapeCarrierUrl } from './carrierScraper'
import { downloadFromCloudMail } from './cloudMailDownloader'
import { parseDocx } from './parser'
import { computeHash, saveRawFile } from './storage'
import { ISchedule, PipelineTrigger, PipelineStage } from './types'
import { validateSchedule } from './validator'

export interface PipelineOptions {
  trigger?: PipelineTrigger
  /** Прямая ссылка на Cloud Mail.ru (пропускает скрейпинг) */
  url?: string
  /** Перепарсить даже если хеш не изменился */
  force?: boolean
  /** Файл передан напрямую (multipart upload) */
  fileBuffer?: Buffer
}

export interface PipelineResult {
  status: 'updated' | 'no_changes' | 'error'
  parseMethod?: string
  fileHash?: string
  stopsCount?: number
  tripsCount?: number
  changesSummary?: string
  durationMs?: number
  error?: string
  errorStage?: string
}

export async function runPipeline(opts: PipelineOptions = {}): Promise<PipelineResult> {
  const { trigger = 'api', url, force = false, fileBuffer } = opts
  const db = getDb()
  const startMs = Date.now()

  // Mutex: проверяем нет ли уже запущенного пайплайна (не старше 10 мин)
  const running = db
    .prepare(
      `SELECT id FROM schedule_pipeline_runs
       WHERE status = 'running' AND created_at > datetime('now', '-10 minutes')`,
    )
    .get()
  if (running) {
    return { status: 'error', error: 'Пайплайн уже запущен', errorStage: 'lock' }
  }

  // Создаём запись о запуске
  const runId = (
    db
      .prepare(`INSERT INTO schedule_pipeline_runs (trigger, status) VALUES (?, 'running')`)
      .run(trigger)
  ).lastInsertRowid as number

  const finish = (result: PipelineResult) => {
    const duration = Date.now() - startMs
    db.prepare(
      `UPDATE schedule_pipeline_runs
       SET status = ?, error_message = ?, error_stage = ?, parse_method = ?, file_hash = ?, duration_ms = ?
       WHERE id = ?`,
    ).run(
      result.status === 'updated' ? 'success' : result.status,
      result.error ?? null,
      result.errorStage ?? null,
      result.parseMethod ?? null,
      result.fileHash ?? null,
      duration,
      runId,
    )
    return { ...result, durationMs: duration }
  }

  try {
    // ── Step 1: получить файл ──────────────────────────────────────────────
    let fileData: Buffer

    if (fileBuffer) {
      fileData = fileBuffer
    } else {
      let cloudMailUrl: string
      if (url) {
        cloudMailUrl = url
      } else {
        try {
          cloudMailUrl = await scrapeCarrierUrl()
          console.log(`Найдена ссылка: ${cloudMailUrl}`)
        } catch (err) {
          return finish(pipelineError(err, 'scrape'))
        }
      }

      try {
        fileData = await downloadFromCloudMail(cloudMailUrl)
        console.log(`Файл скачан, ${fileData.length} байт`)
      } catch (err) {
        return finish(pipelineError(err, 'download'))
      }
    }

    // ── Step 2: хеш и проверка изменений ──────────────────────────────────
    const hash = computeHash(fileData)
    saveRawFile(fileData, hash)

    if (!force) {
      const current = db
        .prepare(`SELECT file_hash FROM schedule WHERE is_active = 1 LIMIT 1`)
        .get() as { file_hash: string } | undefined

      if (current?.file_hash === hash) {
        console.log('Расписание актуально, файл не изменился')
        return finish({ status: 'no_changes', fileHash: hash })
      }
    }

    // ── Step 3: парсинг ───────────────────────────────────────────────────
    let newSchedule: ISchedule
    try {
      newSchedule = parseDocx(fileData)
      console.log(`Парсинг OK`)
    } catch (err) {
      return finish(pipelineError(err, 'parse'))
    }

    // ── Step 4: валидация ─────────────────────────────────────────────────
    const currentRow = db
      .prepare(`SELECT data FROM schedule WHERE is_active = 1 LIMIT 1`)
      .get() as { data: string } | undefined

    const currentSchedule = currentRow ? (JSON.parse(currentRow.data) as ISchedule) : undefined
    const threshold = parseFloat(process.env.VALIDATION_CHANGE_THRESHOLD ?? '0.5')
    const validation = validateSchedule(newSchedule, currentSchedule, threshold)

    if (!validation.ok) {
      console.error('Валидация не пройдена:', validation.errors.join('; '))
      return finish({
        status: 'error',
        error: validation.errors.join('; '),
        errorStage: 'validate',
        fileHash: hash,
      })
    }

    // ── Step 5: сохранение ────────────────────────────────────────────────
    const stopsCount = countStops(newSchedule)
    const tripsCount = countTrips(newSchedule)

    const diff = currentSchedule ? buildDiff(currentSchedule, newSchedule) : null
    const summary = diff ? summarizeDiff(diff) : 'Первое сохранение расписания'

    db.transaction(() => {
      // Деактивируем старую запись
      db.prepare(`UPDATE schedule SET is_active = 0 WHERE is_active = 1`).run()

      // Вставляем новую
      const newRow = db
        .prepare(
          `INSERT INTO schedule (data, file_hash, parse_method, file_type, stops_count, trips_count, is_active)
           VALUES (?, ?, 'deterministic', 'docx', ?, ?, 1)`,
        )
        .run(JSON.stringify(newSchedule), hash, stopsCount, tripsCount)

      // Пишем в ченжлог
      if (diff) {
        db.prepare(
          `INSERT INTO schedule_changelog (schedule_id, diff, summary, parse_method, previous_hash, new_hash)
           VALUES (?, ?, ?, 'deterministic', ?, ?)`,
        ).run(
          newRow.lastInsertRowid,
          JSON.stringify(diff),
          summary,
          currentRow ? hash : null, // previous_hash
          hash,
        )
      }
    })()

    console.log(`Расписание обновлено, ${summary}`)
    return finish({
      status: 'updated',
      parseMethod: 'deterministic',
      fileHash: hash,
      stopsCount,
      tripsCount,
      changesSummary: summary,
    })
  } catch (err) {
    return finish(pipelineError(err, 'save'))
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pipelineError(err: unknown, stage: PipelineStage): PipelineResult {
  const message = err instanceof Error ? err.message : String(err)
  console.error(`Ошибка на этапе ${stage}: ${message}`)
  return { status: 'error', error: message, errorStage: stage }
}

function countStops(schedule: ISchedule): number {
  const stops = new Set<string>()
  const dirs = ['inSP', 'out', 'inLB'] as const
  for (const dir of dirs) {
    for (const day of Object.values(schedule[dir])) {
      for (const stop of Object.keys(day)) stops.add(stop)
    }
  }
  return stops.size
}

function countTrips(schedule: ISchedule): number {
  let max = 0
  const dirs = ['inSP', 'out', 'inLB'] as const
  for (const dir of dirs) {
    for (const day of Object.values(schedule[dir])) {
      for (const times of Object.values(day)) {
        if (times.length > max) max = times.length
      }
    }
  }
  return max
}

type DiffEntry = { direction: string; day: string; stop: string; times?: string[]; before?: string[]; after?: string[] }

interface ScheduleDiff {
  added: DiffEntry[]
  removed: DiffEntry[]
  changed: DiffEntry[]
}

function buildDiff(before: ISchedule, after: ISchedule): ScheduleDiff {
  const diff: ScheduleDiff = { added: [], removed: [], changed: [] }
  const dirs = ['inSP', 'out', 'inLB'] as const
  const days = ['0', '1', '2', '3', '4', '5', '6']

  for (const dir of dirs) {
    for (const day of days) {
      const beforeDay = before[dir]?.[day] ?? {}
      const afterDay = after[dir]?.[day] ?? {}
      const stops = new Set([...Object.keys(beforeDay), ...Object.keys(afterDay)])

      for (const stop of stops) {
        const b = beforeDay[stop]
        const a = afterDay[stop]
        if (!b && a) {
          diff.added.push({ direction: dir, day, stop, times: a })
        } else if (b && !a) {
          diff.removed.push({ direction: dir, day, stop, times: b })
        } else if (b && a && JSON.stringify(b) !== JSON.stringify(a)) {
          diff.changed.push({ direction: dir, day, stop, before: b, after: a })
        }
      }
    }
  }

  return diff
}

function summarizeDiff(diff: ScheduleDiff): string {
  const parts: string[] = []
  if (diff.added.length) parts.push(`добавлено ${diff.added.length} остановок`)
  if (diff.removed.length) parts.push(`удалено ${diff.removed.length} остановок`)
  if (diff.changed.length) parts.push(`изменено ${diff.changed.length} рейсов`)
  return parts.join(', ') || 'без изменений'
}
