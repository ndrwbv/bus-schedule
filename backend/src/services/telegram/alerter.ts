import { setTimeout as delay } from 'node:timers/promises'
import { getDb } from '../db'
import { logger } from '../logger'

const TELEGRAM_API = 'https://api.telegram.org'
const POLL_TIMEOUT_MS = 5_000
const POLL_RETRY_DELAYS_MS = [0, 1_000, 2_000]

interface TelegramUpdate {
  update_id: number
  message?: {
    chat?: { id: number; username?: string; first_name?: string }
  }
}

function getToken(): string | undefined {
  return process.env.TELEGRAM_BOT_TOKEN
}

/**
 * Ensure telegram_subscribers table exists.
 */
export function initTelegramSubscribers(): void {
  const db = getDb()
  db.exec(`
    CREATE TABLE IF NOT EXISTS telegram_subscribers (
      chat_id TEXT PRIMARY KEY,
      username TEXT,
      first_name TEXT,
      subscribed_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `)
}

async function fetchSubscriberUpdates(token: string, offset: number): Promise<TelegramUpdate[] | undefined> {
  const url = `${TELEGRAM_API}/bot${token}/getUpdates?offset=${offset}&timeout=0`
  let failure: { status?: number; cause?: string } = {}

  for (const retryDelay of POLL_RETRY_DELAYS_MS) {
    if (retryDelay) await delay(retryDelay)
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(POLL_TIMEOUT_MS) })
      if (res.ok) {
        const data = (await res.json()) as { ok?: boolean; result?: TelegramUpdate[] } | null
        if (data?.ok === true && Array.isArray(data.result)) return data.result
        failure = { cause: 'invalid_response' }
        continue
      }

      void res.body?.cancel().catch(() => undefined)
      failure = { status: res.status }
      if (res.status === 408 || res.status >= 500) continue
      if (res.status === 429) {
        logger.warn(failure, '[telegram] Лимит запросов при опросе подписчиков')
      } else {
        logger.error(failure, '[telegram] Telegram отклонил опрос подписчиков')
      }
      return
    } catch (err) {
      const code = err instanceof Error ? (err.cause as NodeJS.ErrnoException | undefined)?.code : undefined
      failure = { cause: code ?? (err instanceof Error ? err.name : 'unknown') }
    }
  }

  logger.warn({ ...failure, attempts: POLL_RETRY_DELAYS_MS.length }, '[telegram] Опрос подписчиков недоступен')
}

/**
 * Poll getUpdates to discover new subscribers (users who sent /start).
 * Stores discovered chat_ids in the database for persistent broadcasting.
 * Uses update_offset stored in DB to avoid reprocessing.
 */
export async function pollSubscribers(): Promise<void> {
  const token = getToken()
  if (!token) return

  const db = getDb()
  db.exec(`
    CREATE TABLE IF NOT EXISTS telegram_state (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `)

  const offsetRow = db
    .prepare(`SELECT value FROM telegram_state WHERE key = 'update_offset'`)
    .get() as { value: string } | undefined
  const offset = offsetRow ? parseInt(offsetRow.value, 10) : 0

  const updates = await fetchSubscriberUpdates(token, offset)
  if (!updates) return

  try {
    let maxUpdateId = offset
    for (const update of updates) {
      if (update.update_id >= maxUpdateId) {
        maxUpdateId = update.update_id + 1
      }

      const chat = update.message?.chat
      if (!chat) continue

      // Store every chat that messages the bot (not just /start)
      db.prepare(
        `INSERT OR IGNORE INTO telegram_subscribers (chat_id, username, first_name)
         VALUES (?, ?, ?)`,
      ).run(String(chat.id), chat.username ?? null, chat.first_name ?? null)
    }

    // Persist offset so we don't reprocess updates
    if (maxUpdateId > offset) {
      db.prepare(
        `INSERT INTO telegram_state (key, value) VALUES ('update_offset', ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value
         WHERE CAST(telegram_state.value AS INTEGER) < CAST(excluded.value AS INTEGER)`,
      ).run(String(maxUpdateId))
    }
    logger.info('[telegram] Опрос подписчиков завершён')
  } catch (err) {
    logger.error({ err }, '[telegram] Не удалось сохранить подписчиков')
  }
}

/**
 * Get all subscriber chat_ids. Falls back to TELEGRAM_CHAT_ID env
 * if no subscribers registered yet.
 */
function getSubscriberChatIds(): string[] {
  try {
    const db = getDb()
    const rows = db
      .prepare(`SELECT chat_id FROM telegram_subscribers`)
      .all() as Array<{ chat_id: string }>

    if (rows.length > 0) {
      return rows.map((r) => r.chat_id)
    }
  } catch {
    // Table might not exist yet
  }

  // Fallback: use env variable
  const envChatId = process.env.TELEGRAM_CHAT_ID
  if (envChatId) return [envChatId]

  return []
}

async function broadcastMessage(text: string): Promise<void> {
  const token = getToken()
  if (!token) return

  const chatIds = getSubscriberChatIds()
  if (chatIds.length === 0) {
    console.warn('[telegram] Нет подписчиков. Отправьте /start боту.')
    return
  }

  for (const chatId of chatIds) {
    try {
      const res = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
      })
      if (!res.ok) {
        const body = await res.text()
        console.error(`[telegram] Ошибка отправки в ${chatId}: HTTP ${res.status} — ${body}`)

        // If bot was blocked by user, remove subscriber
        if (res.status === 403) {
          try {
            const db = getDb()
            db.prepare(`DELETE FROM telegram_subscribers WHERE chat_id = ?`).run(chatId)
            console.log(`[telegram] Подписчик ${chatId} удалён (бот заблокирован)`)
          } catch { /* ignore */ }
        }
      }
    } catch (err) {
      console.error(`[telegram] Не удалось отправить в ${chatId}: ${err}`)
    }
  }
}

export const telegramAlerter = {
  /** Пайплайн запущен */
  pipelineStarted: (trigger: string, hasUrl: boolean, hasFile: boolean) => {
    const source = hasFile ? 'загрузка файла' : hasUrl ? 'прямая ссылка' : 'скрейпинг + скачивание'
    return broadcastMessage(
      `🔄 <b>SeverBus: обновление запущено</b>\n\nИсточник: ${source}\nТриггер: ${trigger}`,
    )
  },

  /** Прогресс пайплайна */
  pipelineProgress: (stage: string) =>
    broadcastMessage(`⏳ <b>SeverBus</b>: ${stage}`),

  /** Ошибка скрейпинга сайта перевозчика */
  scrapeError: (reason: string) =>
    broadcastMessage(
      `🚨 <b>SeverBus: ошибка скрейпинга</b>\n\nНе удалось найти ссылку на Word-файл 112С на сайте перевозчика.\n\n<code>${reason}</code>`,
    ),

  /** Ошибка скачивания с Cloud Mail.ru */
  downloadError: (reason: string) =>
    broadcastMessage(
      `🚨 <b>SeverBus: ошибка скачивания</b>\n\nНе удалось скачать файл с Cloud Mail.ru.\n\n<code>${reason}</code>`,
    ),

  /** Детерминированный парсинг не прошёл */
  parseError: (reason: string) =>
    broadcastMessage(
      `⚠️ <b>SeverBus: ошибка парсинга</b>\n\nДетерминированный парсер не прошёл. Расписание НЕ обновлено.\n\n<code>${reason}</code>`,
    ),

  /** Валидация не прошла */
  validationError: (details: string) =>
    broadcastMessage(
      `⚠️ <b>SeverBus: валидация не пройдена</b>\n\nРасписание НЕ обновлено.\n\n<code>${details}</code>`,
    ),

  /** Ошибка сохранения */
  saveError: (reason: string) =>
    broadcastMessage(
      `🚨 <b>SeverBus: ошибка сохранения</b>\n\nНе удалось сохранить расписание в базу.\n\n<code>${reason}</code>`,
    ),

  /** Расписание успешно обновлено */
  scheduleUpdated: (summary: string, parseMethod: string, durationMs: number) =>
    broadcastMessage(
      `✅ <b>SeverBus: расписание обновлено</b>\n\n${summary}\nМетод: ${parseMethod}\nВремя: ${durationMs}ms`,
    ),

  /** Запланирован повтор пайплайна */
  pipelineRetryScheduled: (attempt: number, maxAttempts: number, delayMin: number, error: string) =>
    broadcastMessage(
      `🔁 <b>SeverBus: повтор через ${delayMin} мин</b>\n\nПопытка ${attempt}/${maxAttempts} не удалась.\nСледующая попытка: ${attempt + 1}/${maxAttempts}\n\n<code>${error}</code>`,
    ),

  /** Все попытки исчерпаны */
  pipelineRetriesExhausted: (maxAttempts: number, error: string) =>
    broadcastMessage(
      `🚨 <b>SeverBus: обновление не удалось</b>\n\nВсе ${maxAttempts} попытки исчерпаны. Расписание НЕ обновлено. Требуется ручная проверка.\n\n<code>${error}</code>`,
    ),
}
