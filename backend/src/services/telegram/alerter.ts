import { getDb } from '../db'

const TELEGRAM_API = 'https://api.telegram.org'

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

  try {
    const url = `${TELEGRAM_API}/bot${token}/getUpdates?offset=${offset}&timeout=0`
    const res = await fetch(url)
    if (!res.ok) return

    const data = (await res.json()) as {
      result?: Array<{
        update_id: number
        message?: {
          text?: string
          chat?: { id: number; username?: string; first_name?: string }
        }
      }>
    }

    if (!data.result?.length) return

    let maxUpdateId = offset
    for (const update of data.result) {
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
    db.prepare(
      `INSERT INTO telegram_state (key, value) VALUES ('update_offset', ?)
       ON CONFLICT(key) DO UPDATE SET value = ?`,
    ).run(String(maxUpdateId), String(maxUpdateId))
  } catch (err) {
    console.error(`[telegram] Ошибка при опросе подписчиков: ${err}`)
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
}
