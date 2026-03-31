import cron, { ScheduledTask } from 'node-cron'
import { cleanupOldComplains } from '../../routes/complains'

let task: ScheduledTask | null = null

/** Run cleanup daily at 23:30 Tomsk time */
export function startComplainsCron(): void {
  const schedule = '30 23 * * *'
  const timezone = 'Asia/Tomsk'

  task = cron.schedule(
    schedule,
    () => {
      console.log('[cron] Очистка жалоб...')
      try {
        cleanupOldComplains()
      } catch (err) {
        console.error('[cron] Ошибка очистки жалоб:', err)
      }
    },
    { timezone },
  )

  console.log(`Cron очистки жалоб запущен: "${schedule}" (${timezone})`)
}

export function stopComplainsCron(): void {
  task?.stop()
  task = null
}
