import * as cheerio from 'cheerio'
import * as fs from 'node:fs'
import * as path from 'node:path'

const CARRIER_URL = 'https://xn--80aasi5akda.online/documents'
const ROUTE_MARKER = '112С'

/**
 * Scrape the carrier's website to find the current Cloud Mail.ru link
 * for route 112С Word schedule file.
 *
 * Site structure: accordion sections per carrier, inside each —
 * <strong>112С маршрут ...</strong><br><ul><li>...</li></ul>
 * The Word link is in a <li> containing "Расписание в файле (Word)".
 */
export async function scrapeCarrierUrl(): Promise<string> {
  const res = await fetchWithTimeout(CARRIER_URL, 10_000)
  if (!res.ok) {
    throw new Error(`Сайт перевозчика вернул статус ${res.status}`)
  }

  const html = await res.text()
  const $ = cheerio.load(html)

  let cloudMailUrl: string | null = null

  // Strategy 1: Find <strong> with "112С", then the <ul> after it,
  // then <li> containing "Расписание в файле (Word)"
  $('strong').each((_i, el) => {
    if (!$(el).text().includes(ROUTE_MARKER)) return

    // The <ul> follows the <strong> (possibly with a <br> in between)
    let sibling = $(el).next()
    // Skip <br> tags between <strong> and <ul>
    while (sibling.length && sibling.prop('tagName') === 'BR') {
      sibling = sibling.next()
    }

    if (sibling.prop('tagName') !== 'UL') return

    sibling.find('li').each((_j, li) => {
      const liText = $(li).text()
      if (/расписание в файле.*word/i.test(liText)) {
        const href = $(li).find('a[href*="cloud.mail.ru"]').attr('href')
        if (href) {
          cloudMailUrl = href
          return false // break inner
        }
      }
    })

    if (cloudMailUrl) return false // break outer
  })

  // Strategy 2 (fallback): find any <li> with both "112С" context and "Word"
  if (!cloudMailUrl) {
    $('li').each((_i, el) => {
      const text = $(el).text()
      if (/расписание в файле.*word/i.test(text)) {
        // Check if a nearby <strong> mentions 112С
        const parentHtml = $(el).parent().prevAll('strong').first().text()
        if (parentHtml.includes(ROUTE_MARKER)) {
          const href = $(el).find('a[href*="cloud.mail.ru"]').attr('href')
          if (href) {
            cloudMailUrl = href
            return false
          }
        }
      }
    })
  }

  if (!cloudMailUrl) {
    const dumpPath = path.join(process.cwd(), 'data', 'last-scrape-fail.html')
    fs.mkdirSync(path.dirname(dumpPath), { recursive: true })
    fs.writeFileSync(dumpPath, html, 'utf-8')
    console.error(`[scrape] Страница сохранена в ${dumpPath} (${html.length} символов)`)
    throw new Error('Не найдена ссылка на Word-файл 112С на сайте перевозчика')
  }

  return cloudMailUrl
}

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ru-RU,ru;q=0.9',
      },
    })
  } finally {
    clearTimeout(timer)
  }
}
