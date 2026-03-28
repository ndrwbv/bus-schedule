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
const MAIL_RU_API = 'https://cloud.mail.ru'
const MAX_RETRIES = () => parseInt(process.env.DOWNLOAD_MAX_RETRIES ?? '3', 10)

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
  const cdnHost = await getCdnHost(shareUrl)

  // Step 2: get download token
  const token = await getDownloadToken(shareUrl)

  // Step 3: build file path from shareUrl and download
  const filePath = getFilePath(shareUrl)
  const downloadUrl = `${cdnHost}/${filePath}?key=${encodeURIComponent(token)}`

  const res = await fetch(downloadUrl, {
    headers: {
      Referer: shareUrl,
      'User-Agent': 'Mozilla/5.0 (compatible; SeverBus/1.0)',
    },
  })

  if (!res.ok) {
    throw new Error(`Ошибка скачивания файла: HTTP ${res.status}`)
  }

  const contentType = res.headers.get('content-type') ?? ''
  if (!contentType.includes('officedocument') && !contentType.includes('octet-stream') && !contentType.includes('zip')) {
    // Might be an error page
    const text = await res.text()
    throw new Error(`Неожиданный Content-Type: ${contentType}. Ответ: ${text.slice(0, 200)}`)
  }

  const arrayBuffer = await res.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

async function getCdnHost(shareUrl: string): Promise<string> {
  const res = await fetch(shareUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SeverBus/1.0)' },
  })
  if (!res.ok) throw new Error(`Страница Cloud Mail.ru вернула ${res.status}`)

  const html = await res.text()

  // Look for weblink_get in page HTML (usually in a JSON config or data attribute)
  // Pattern: "weblink_get":["https://...cdn..."]
  const match = html.match(/"weblink_get"\s*:\s*\[\s*"([^"]+)"/)
  if (match) return match[1].replace(/\/$/, '')

  // Alternative: look for data-cdn or similar patterns
  const match2 = html.match(/window\.__store__.*?"weblink_get"\s*:\s*\[\s*"([^"]+)"/)
  if (match2) return match2[1].replace(/\/$/, '')

  // Fallback CDN host
  return 'https://cloud.mail.ru/weblink/get'
}

async function getDownloadToken(referer: string): Promise<string> {
  const res = await fetch(TOKEN_URL, {
    headers: {
      Referer: referer,
      'User-Agent': 'Mozilla/5.0 (compatible; SeverBus/1.0)',
      'X-Requested-With': 'XMLHttpRequest',
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
