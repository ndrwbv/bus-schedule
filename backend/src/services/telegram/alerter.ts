import * as os from 'os'
import { getDb } from '../db'
import { getErrorStats } from '../errorTracker'

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
 * Poll getUpdates to discover new subscribers and handle commands.
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

      // Handle /stats command
      const text = update.message?.text?.trim()
      if (text === '/stats') {
        await handleStatsCommand(String(chat.id))
      }
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
 * Start periodic polling for Telegram updates (commands + subscribers).
 */
export function startTelegramPolling(): void {
  const token = getToken()
  if (!token) {
    console.log('[telegram] TELEGRAM_BOT_TOKEN not set, polling disabled')
    return
  }

  // Poll every 10 seconds
  setInterval(() => {
    pollSubscribers().catch(err => {
      console.error('[telegram] Polling error:', err)
    })
  }, 10_000)

  console.log('[telegram] Polling started (10s interval)')
}

/**
 * Handle /stats command — respond with health + error info.
 */
async function handleStatsCommand(chatId: string): Promise<void> {
  const token = getToken()
  if (!token) return

  try {
    const db = getDb()
    const uptime = process.uptime()
    const mem = process.memoryUsage()

    // DB status
    let dbStatus = 'ok'
    let dbSizeMb = 0
    try {
      db.prepare('SELECT 1').get()
      const pragma = db.prepare('PRAGMA page_count').get() as { page_count: number } | undefined
      const pageSize = db.prepare('PRAGMA page_size').get() as { page_size: number } | undefined
      dbSizeMb = Math.round(((pragma?.page_count ?? 0) * (pageSize?.page_size ?? 0)) / 1024 / 1024 * 100) / 100
    } catch {
      dbStatus = 'error'
    }

    // Visit stats
    let daily = 0, weekly = 0
    try {
      const d = db.prepare(`SELECT COUNT(DISTINCT user_id) as cnt FROM visits WHERE created_at > datetime('now', '-1 day')`).get() as { cnt: number }
      const w = db.prepare(`SELECT COUNT(DISTINCT user_id) as cnt FROM visits WHERE created_at > datetime('now', '-7 days')`).get() as { cnt: number }
      daily = d.cnt
      weekly = w.cnt
    } catch { /* ignore */ }

    // Complaints today
    let complainsToday = 0
    try {
      const row = db.prepare(`SELECT COUNT(*) as cnt FROM complains WHERE created_at > datetime('now', '-1 day')`).get() as { cnt: number }
      complainsToday = row.cnt
    } catch { /* ignore */ }

    // Error stats
    const errStats = getErrorStats()

    const uptimeH = Math.floor(uptime / 3600)
    const uptimeM = Math.floor((uptime % 3600) / 60)

    const text = [
      `📊 <b>SeverBus Stats</b>`,
      ``,
      `<b>Server</b>`,
      `Uptime: ${uptimeH}h ${uptimeM}m`,
      `Memory: ${Math.round(mem.rss / 1024 / 1024)}MB (heap: ${Math.round(mem.heapUsed / 1024 / 1024)}MB)`,
      `CPU: ${os.cpus().length} cores, load: ${os.loadavg().map(v => v.toFixed(2)).join(', ')}`,
      ``,
      `<b>DB</b>: ${dbStatus}, ${dbSizeMb}MB`,
      ``,
      `<b>Users</b>: ${daily} today, ${weekly} week`,
      `<b>Complaints</b>: ${complainsToday} today`,
      ``,
      `<b>500 Errors</b>`,
      `Last hour: ${errStats.lastHour}`,
      `Last 24h: ${errStats.last24h}`,
      `Total tracked: ${errStats.total}`,
      ...(errStats.recent.length > 0
        ? [``, `<b>Recent errors:</b>`, ...errStats.recent.map(e => `• ${e.method} ${e.path}: ${e.message.slice(0, 80)}`)]
        : []),
    ].join('\n')

    await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
    })
  } catch (err) {
    console.error(`[telegram] Error handling /stats:`, err)
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

// Debounce: don't spam on repeated 500s
let lastErrorAlertAt = 0;
const ERROR_ALERT_COOLDOWN_MS = 60_000; // 1 minute

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

  /** 500 error alert (debounced) */
  serverError: (method: string, path: string, message: string) => {
    const now = Date.now()
    if (now - lastErrorAlertAt < ERROR_ALERT_COOLDOWN_MS) return Promise.resolve()
    lastErrorAlertAt = now

    return broadcastMessage(
      `🔥 <b>SeverBus: 500 ошибка</b>\n\n<code>${method} ${path}</code>\n<code>${message.slice(0, 200)}</code>`,
    )
  },
}
