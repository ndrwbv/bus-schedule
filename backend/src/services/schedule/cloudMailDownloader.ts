/**
 * Download a file from a public Cloud Mail.ru share link.
 *
 * Protocol (3 HTTP requests, no auth required):
 *   1. GET {shareUrl}  → parse HTML, extract weblink_get CDN host
 *   2. GET https://cloud.mail.ru/api/v2/tokens/download  → get temporary token
 *   3. GET {cdnHost}/{filePath}?key={token}  → download file
 *
 * Where filePath = part of URL after /public/ (e.g. "YJGH/vLzFF48pJ")
 */

const TOKEN_URL = 'https://cloud.mail.ru/api/v2/tokens/download'
const MAX_RETRIES = () => parseInt(process.env.DOWNLOAD_MAX_RETRIES ?? '3', 10)

/** Realistic browser headers to avoid 403 blocks */
const BROWSER_HEADERS: Record<string, string> = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Upgrade-Insecure-Requests': '1',
}

export async function downloadFromCloudMail(shareUrl: string): Promise<Buffer> {
  let lastError: Error | null = null
  const maxRetries = MAX_RETRIES()

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await doDownload(shareUrl)
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000
        console.warn(`Попытка ${attempt}/${maxRetries} не удалась: ${lastError.message}. Повтор через ${delay}ms`)
        await sleep(delay)
      }
    }
  }

  throw lastError ?? new Error('Не удалось скачать файл с Cloud Mail.ru')
}

async function doDownload(shareUrl: string): Promise<Buffer> {
  // Step 1: get CDN host from share page
  const { cdnHost, cookies } = await getCdnHostAndCookies(shareUrl)

  // Step 2: get download token (pass cookies from step 1)
  const token = await getDownloadToken(shareUrl, cookies)

  // Step 3: build file path from shareUrl and download
  const filePath = getFilePath(shareUrl)
  const downloadUrl = `${cdnHost}/${filePath}?key=${encodeURIComponent(token)}`

  const res = await fetch(downloadUrl, {
    headers: {
      ...BROWSER_HEADERS,
      Referer: shareUrl,
      ...(cookies ? { Cookie: cookies } : {}),
    },
  })

  if (!res.ok) {
    throw new Error(`Ошибка скачивания файла: HTTP ${res.status}`)
  }

  const contentType = res.headers.get('content-type') ?? ''
  if (!contentType.includes('officedocument') && !contentType.includes('octet-stream') && !contentType.includes('zip')) {
    const text = await res.text()
    throw new Error(`Неожиданный Content-Type: ${contentType}. Ответ: ${text.slice(0, 200)}`)
  }

  const arrayBuffer = await res.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

/** Extract cookies from Set-Cookie headers */
function extractCookies(res: Response): string {
  const setCookies = res.headers.getSetCookie?.() ?? []
  return setCookies
    .map(c => c.split(';')[0])
    .filter(Boolean)
    .join('; ')
}

async function getCdnHostAndCookies(shareUrl: string): Promise<{ cdnHost: string; cookies: string }> {
  const res = await fetch(shareUrl, {
    headers: BROWSER_HEADERS,
    redirect: 'follow',
  })

  if (!res.ok) throw new Error(`Страница Cloud Mail.ru вернула ${res.status}`)

  const cookies = extractCookies(res)
  const html = await res.text()

  // Look for weblink_get in page HTML (usually in a JSON config)
  const match = html.match(/"weblink_get"\s*:\s*\[\s*"([^"]+)"/)
  if (match) return { cdnHost: match[1].replace(/\/$/, ''), cookies }

  // Alternative pattern
  const match2 = html.match(/weblink_get[^[]*\[\s*"([^"]+)"/)
  if (match2) return { cdnHost: match2[1].replace(/\/$/, ''), cookies }

  // Fallback CDN host
  return { cdnHost: 'https://cloclo.cloud.mail.ru/weblink/view', cookies }
}

async function getDownloadToken(referer: string, cookies: string): Promise<string> {
  const res = await fetch(TOKEN_URL, {
    headers: {
      ...BROWSER_HEADERS,
      Referer: referer,
      'X-Requested-With': 'XMLHttpRequest',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
      ...(cookies ? { Cookie: cookies } : {}),
    },
  })

  if (!res.ok) throw new Error(`Ошибка получения токена: HTTP ${res.status}`)

  const json = await res.json() as { body?: { token?: string }; token?: string }
  const token = json?.body?.token ?? json?.token

  if (!token) throw new Error(`Токен не найден в ответе: ${JSON.stringify(json)}`)
  return token
}

function getFilePath(shareUrl: string): string {
  // https://cloud.mail.ru/public/YJGH/vLzFF48pJ → YJGH/vLzFF48pJ
  const match = shareUrl.match(/\/public\/(.+)$/)
  if (!match) throw new Error(`Не удалось извлечь путь файла из URL: ${shareUrl}`)
  return match[1]
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
