import cron, { ScheduledTask } from 'node-cron'
import { runPipeline } from './pipeline'
import { telegramAlerter } from '../telegram/alerter'

let task: ScheduledTask | null = null

const RETRY_DELAYS_MS = [
  60 * 60 * 1000,      // 1 час
  2 * 60 * 60 * 1000,  // 2 часа
]

async function runWithRetries(): Promise<void> {
  const maxAttempts = 1 + RETRY_DELAYS_MS.length // 1 основная + 2 повтора

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    console.log(`[cron] Попытка ${attempt + 1}/${maxAttempts}...`)

    try {
      const result = await runPipeline({ trigger: 'cron' })

      if (result.status === 'updated') {
        console.log(`[cron] Расписание обновлено: ${result.changesSummary}`)
        return
      } else if (result.status === 'no_changes') {
        console.log('[cron] Расписание актуально, файл не изменился')
        return
      }

      // status === 'error'
      console.error(`[cron] Ошибка: ${result.error} (этап: ${result.errorStage})`)

      if (attempt < RETRY_DELAYS_MS.length) {
        const delayMs = RETRY_DELAYS_MS[attempt]
        const delayMin = Math.round(delayMs / 60_000)
        console.log(`[cron] Повтор через ${delayMin} мин...`)
        await telegramAlerter.pipelineRetryScheduled(attempt + 1, maxAttempts, delayMin, result.error ?? '')
        await sleep(delayMs)
      } else {
        await telegramAlerter.pipelineRetriesExhausted(maxAttempts, result.error ?? '')
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('[cron] Необработанная ошибка:', msg)

      if (attempt < RETRY_DELAYS_MS.length) {
        const delayMs = RETRY_DELAYS_MS[attempt]
        const delayMin = Math.round(delayMs / 60_000)
        console.log(`[cron] Повтор через ${delayMin} мин...`)
        await telegramAlerter.pipelineRetryScheduled(attempt + 1, maxAttempts, delayMin, msg)
        await sleep(delayMs)
      } else {
        await telegramAlerter.pipelineRetriesExhausted(maxAttempts, msg)
      }
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function startScheduleCron(): void {
  const schedule = process.env.CRON_SCHEDULE ?? '0 30 21 * * *'
  const timezone = process.env.CRON_TIMEZONE ?? 'Asia/Tomsk'

  if (!cron.validate(schedule)) {
    console.error(`Некорректное CRON_SCHEDULE: "${schedule}", cron не запущен`)
    return
  }

  task = cron.schedule(
    schedule,
    () => {
      console.log('[cron] Запуск проверки расписания...')
      runWithRetries().catch((err) => {
        console.error('[cron] Критическая ошибка в runWithRetries:', err)
      })
    },
    { timezone },
  )

  console.log(`Cron запущен: "${schedule}" (${timezone})`)
}

export function stopScheduleCron(): void {
  task?.stop()
  task = null
}
