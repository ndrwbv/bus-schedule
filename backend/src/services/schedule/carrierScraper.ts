import * as cheerio from 'cheerio'

const CARRIER_URL = 'https://xn--80aasi5akda.online/documents'
const ROUTE_MARKER = '112С'
const WORD_LINK_TEXT = /расписание в файле.*word/i

/**
 * Scrape the carrier's website to find the current Cloud Mail.ru link
 * for route 112С Word schedule file.
 */
export async function scrapeCarrierUrl(): Promise<string> {
  const res = await fetchWithTimeout(CARRIER_URL, 10_000)
  if (!res.ok) {
    throw new Error(`Сайт перевозчика вернул статус ${res.status}`)
  }

  const html = await res.text()
  const $ = cheerio.load(html)

  // Find the Cloud Mail.ru link near the 112С section
  let cloudMailUrl: string | null = null

  $('a').each((_i, el) => {
    const href = $(el).attr('href') ?? ''
    const text = $(el).text()

    if (
      href.includes('cloud.mail.ru') &&
      WORD_LINK_TEXT.test(text)
    ) {
      // Check if it's near a 112С section
      const section = $(el).closest('section, div, article, li, p').text()
      if (section.includes(ROUTE_MARKER) || checkNearbyContext($, el)) {
        cloudMailUrl = href
        return false // break
      }
    }
  })

  // Fallback: any cloud.mail.ru link that's near 112С text
  if (!cloudMailUrl) {
    $('a[href*="cloud.mail.ru"]').each((_i, el) => {
      const nearText = getNearbyText($, el, 500)
      if (nearText.includes(ROUTE_MARKER)) {
        cloudMailUrl = $(el).attr('href') ?? null
        return false
      }
    })
  }

  if (!cloudMailUrl) {
    throw new Error('Не найдена ссылка на Word-файл 112С на сайте перевозчика')
  }

  return cloudMailUrl
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function checkNearbyContext($: ReturnType<typeof cheerio.load>, el: any): boolean {
  const text = getNearbyText($, el, 300)
  return text.includes(ROUTE_MARKER)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getNearbyText($: ReturnType<typeof cheerio.load>, el: any, chars: number): string {
  const parent = $(el).parent()
  const grandparent = parent.parent()
  return (grandparent.text() || parent.text()).slice(0, chars)
}

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}
