const TELEGRAM_API = 'https://api.telegram.org'

let cachedChatId: string | null = null

function getToken(): string | undefined {
  return process.env.TELEGRAM_BOT_TOKEN
}

/**
 * Resolve chat_id: use TELEGRAM_CHAT_ID env if set,
 * otherwise call getUpdates to find the first chat that sent /start.
 */
async function resolveChatId(token: string): Promise<string | null> {
  if (cachedChatId) return cachedChatId

  const envChatId = process.env.TELEGRAM_CHAT_ID
  if (envChatId) {
    cachedChatId = envChatId
    return cachedChatId
  }

  try {
    const res = await fetch(`${TELEGRAM_API}/bot${token}/getUpdates`)
    if (!res.ok) return null
    const data = (await res.json()) as { result?: Array<{ message?: { chat?: { id: number } } }> }
    const chatId = data.result?.find((u) => u.message?.chat)?.message?.chat?.id
    if (chatId) {
      cachedChatId = String(chatId)
      console.log(`[telegram] Chat ID получен автоматически: ${cachedChatId}`)
      return cachedChatId
    }
  } catch (err) {
    console.error(`[telegram] Не удалось получить chat_id: ${err}`)
  }

  return null
}

async function sendMessage(text: string): Promise<void> {
  const token = getToken()
  if (!token) return

  const chatId = await resolveChatId(token)
  if (!chatId) {
    console.warn('[telegram] Chat ID не найден. Отправьте /start боту, затем перезапустите сервер.')
    return
  }

  try {
    const res = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
    })
    if (!res.ok) {
      console.error(`[telegram] Ошибка отправки: HTTP ${res.status}`)
    }
  } catch (err) {
    console.error(`[telegram] Не удалось отправить сообщение: ${err}`)
  }
}

export const telegramAlerter = {
  /** Ошибка скрейпинга сайта перевозчика */
  scrapeError: (reason: string) =>
    sendMessage(
      `🚨 <b>SeverBus: ошибка скрейпинга</b>\n\nНе удалось найти ссылку на Word-файл 112С на сайте перевозчика.\n\n<code>${reason}</code>`,
    ),

  /** Ошибка скачивания с Cloud Mail.ru */
  downloadError: (reason: string) =>
    sendMessage(
      `🚨 <b>SeverBus: ошибка скачивания</b>\n\nНе удалось скачать файл с Cloud Mail.ru.\n\n<code>${reason}</code>`,
    ),

  /** Детерминированный парсинг не прошёл */
  parseError: (reason: string) =>
    sendMessage(
      `⚠️ <b>SeverBus: ошибка парсинга</b>\n\nДетерминированный парсер не прошёл. Расписание НЕ обновлено.\n\n<code>${reason}</code>`,
    ),

  /** Валидация не прошла */
  validationError: (details: string) =>
    sendMessage(
      `⚠️ <b>SeverBus: валидация не пройдена</b>\n\nРасписание НЕ обновлено.\n\n<code>${details}</code>`,
    ),

  /** Расписание успешно обновлено */
  scheduleUpdated: (summary: string, parseMethod: string, durationMs: number) =>
    sendMessage(
      `✅ <b>SeverBus: расписание обновлено</b>\n\n${summary}\nМетод: ${parseMethod}\nВремя: ${durationMs}ms`,
    ),
}
