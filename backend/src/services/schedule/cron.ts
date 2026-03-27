import cron, { ScheduledTask } from 'node-cron'
import { runPipeline } from './pipeline'

let task: ScheduledTask | null = null

export function startScheduleCron(): void {
  const schedule = process.env.CRON_SCHEDULE ?? '0 30 21 * * *'
  const timezone = process.env.CRON_TIMEZONE ?? 'Asia/Tomsk'

  if (!cron.validate(schedule)) {
    console.error(`Некорректное CRON_SCHEDULE: "${schedule}", cron не запущен`)
    return
  }

  task = cron.schedule(
    schedule,
    async () => {
      console.log('[cron] Запуск проверки расписания...')
      try {
        const result = await runPipeline({ trigger: 'cron' })
        if (result.status === 'updated') {
          console.log(`[cron] Расписание обновлено: ${result.changesSummary}`)
        } else if (result.status === 'no_changes') {
          console.log('[cron] Расписание актуально, файл не изменился')
        } else {
          console.error(`[cron] Ошибка: ${result.error} (этап: ${result.errorStage})`)
        }
      } catch (err) {
        console.error('[cron] Необработанная ошибка:', err)
      }
    },
    { timezone },
  )

  console.log(`Cron запущен: "${schedule}" (${timezone})`)
}

export function stopScheduleCron(): void {
  task?.stop()
  task = null
}
