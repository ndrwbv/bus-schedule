const TELEGRAM_API = 'https://api.telegram.org'

function isConfigured(): boolean {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID)
}

async function sendMessage(text: string): Promise<void> {
  if (!isConfigured()) return

  const token = process.env.TELEGRAM_BOT_TOKEN!
  const chatId = process.env.TELEGRAM_CHAT_ID!

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
