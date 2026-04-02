import cron, { ScheduledTask } from 'node-cron';
import { getDb } from '../db';
import { logger } from '../logger';

let task: ScheduledTask | null = null;

const RETENTION_DAYS = Number(process.env.LOGS_RETENTION_DAYS) || 7;

/** Run cleanup daily at 3:00 AM Tomsk time — remove old log entries */
export function startLogsCron(): void {
  const schedule = '0 3 * * *';
  const timezone = 'Asia/Tomsk';

  task = cron.schedule(
    schedule,
    () => {
      try {
        const db = getDb();
        const result = db.prepare(
          `DELETE FROM request_logs WHERE created_at < datetime('now', ?)`
        ).run(`-${RETENTION_DAYS} days`);
        logger.info(`[cron] Очистка логов: удалено ${result.changes} записей старше ${RETENTION_DAYS} дней`);
      } catch (err) {
        logger.error({ err }, '[cron] Ошибка очистки логов');
      }
    },
    { timezone },
  );

  logger.info(`Cron очистки логов запущен: "${schedule}" (${timezone}), хранение ${RETENTION_DAYS} дней`);
}

export function stopLogsCron(): void {
  task?.stop();
  task = null;
}
