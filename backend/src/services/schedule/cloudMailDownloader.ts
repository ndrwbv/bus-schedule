/**
 * Download a file from a public Cloud Mail.ru share link using Puppeteer.
 *
 * Cloud Mail.ru opens .docx files in an online editor, so simple HTTP
 * requests no longer work. Instead we launch a headless browser,
 * open the share page, click "Download" and capture the file via CDP
 * download to a temp directory.
 */

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import puppeteer, { Page, CDPSession } from 'puppeteer-core'

const MAX_RETRIES = () => parseInt(process.env.DOWNLOAD_MAX_RETRIES ?? '3', 10)
const DOWNLOAD_TIMEOUT = 60_000

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
        console.warn(`[cloud-mail] Попытка ${attempt}/${maxRetries} не удалась: ${lastError.message}. Повтор через ${delay}ms`)
        await sleep(delay)
      }
    }
  }

  throw lastError ?? new Error('Не удалось скачать файл с Cloud Mail.ru')
}

async function doDownload(shareUrl: string): Promise<Buffer> {
  const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser'
  const browser = await puppeteer.launch({
    headless: true,
    executablePath,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  })

  // Create temp dir for downloads
  const downloadDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cloud-mail-'))
  console.log(`[cloud-mail] Папка загрузки: ${downloadDir}`)

  try {
    const page = await browser.newPage()

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    )

    // Set up CDP to allow downloads to our temp dir
    const cdp = await page.createCDPSession()
    await cdp.send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: downloadDir,
    })

    // Open the share page
    console.log(`[cloud-mail] Открываем: ${shareUrl}`)
    await page.goto(shareUrl, { waitUntil: 'networkidle2', timeout: DOWNLOAD_TIMEOUT })

    // Wait for the page to fully render
    await sleep(3000)

    // Try to find and click the download button
    const clicked = await tryClickDownload(page)

    if (clicked) {
      // Wait for file to appear in download dir
      const filePath = await waitForDownload(downloadDir, 45_000)
      if (filePath) {
        console.log(`[cloud-mail] Файл скачан: ${filePath}`)
        const buffer = fs.readFileSync(filePath)
        return buffer
      }
    }

    // Fallback: try CDP fetch approach — get cookies from browser and download via fetch
    console.log('[cloud-mail] Кнопка не сработала, пробуем CDP fetch...')
    const fallbackBuffer = await tryCdpFetch(page, cdp, shareUrl)
    if (fallbackBuffer) {
      return fallbackBuffer
    }

    // Save debug info
    const debugDir = process.cwd() + '/data'
    await page.screenshot({ path: `${debugDir}/cloud-mail-debug.png`, fullPage: true }).catch(() => {})
    const html = await page.content().catch(() => '')
    if (html) fs.writeFileSync(`${debugDir}/cloud-mail-debug.html`, html, 'utf-8')
    console.error(`[cloud-mail] Дебаг сохранён в ${debugDir}/cloud-mail-debug.*`)
    throw new Error('Не удалось скачать файл: кнопка скачивания не найдена или файл не получен')
  } finally {
    await browser.close()
    // Cleanup temp dir
    fs.rmSync(downloadDir, { recursive: true, force: true })
  }
}

/**
 * Wait for a file to appear in the download directory.
 * Ignores .crdownload (Chrome partial download) files.
 */
async function waitForDownload(dir: string, timeoutMs: number): Promise<string | null> {
  const deadline = Date.now() + timeoutMs

  while (Date.now() < deadline) {
    const files = fs.readdirSync(dir)
    const ready = files.filter(f => !f.endsWith('.crdownload') && !f.startsWith('.'))

    if (ready.length > 0) {
      const filePath = path.join(dir, ready[0])
      // Wait a bit more to ensure file is fully written
      await sleep(500)
      const stat = fs.statSync(filePath)
      if (stat.size > 100) {
        return filePath
      }
    }

    await sleep(1000)
  }

  console.warn('[cloud-mail] Таймаут ожидания файла в папке загрузки')
  return null
}

/**
 * Try various selectors to find and click the download button.
 */
async function tryClickDownload(page: Page): Promise<boolean> {
  const selectors = [
    // Cloud Mail.ru share page download button
    'a[href="#btn-download"]',
    '[href="#btn-download"]',
    'button[data-qa="download"]',
    'a[data-qa="download"]',
    '[data-testid="download"]',
    'button[title="Скачать"]',
    'a[title="Скачать"]',
    // Editor toolbar buttons
    '.b-toolbar__btn[data-name="download"]',
    '.file-actions__download',
  ]

  for (const selector of selectors) {
    try {
      const el = await page.$(selector)
      if (el) {
        await el.click()
        console.log(`[cloud-mail] Нажата кнопка: ${selector}`)
        return true
      }
    } catch {
      // try next
    }
  }

  // Fallback: click any element with download-related text
  try {
    const clicked = await page.evaluate(`(function() {
      var elements = document.querySelectorAll('button, a, [role="button"], span');
      for (var i = 0; i < elements.length; i++) {
        var text = elements[i].innerText ? elements[i].innerText.trim() : '';
        if (/^скачать$|^download$/i.test(text)) {
          elements[i].click();
          return text;
        }
      }
      return false;
    })()`)
    if (clicked) {
      console.log(`[cloud-mail] Нажата кнопка (evaluate): "${clicked}"`)
      return true
    }
  } catch {
    // ignore
  }

  console.warn('[cloud-mail] Кнопка скачивания не найдена')
  return false
}

/**
 * Fallback: extract weblink_get CDN host and download via CDP Fetch.
 * Uses the browser's cookies so the request looks identical to a browser request.
 */
async function tryCdpFetch(page: Page, cdp: CDPSession, shareUrl: string): Promise<Buffer | null> {
  try {
    const cdnHost = await page.evaluate(`(function() {
      var html = document.documentElement.outerHTML;
      var match = html.match(/"weblink_get"\\s*:\\s*\\[\\s*"([^"]+)"/);
      return match ? match[1] : null;
    })()`) as string | null

    if (!cdnHost) {
      console.warn('[cloud-mail] weblink_get не найден на странице')
      return null
    }

    const host = cdnHost.replace(/\/$/, '')
    const pathMatch = shareUrl.match(/\/public\/(.+)$/)
    if (!pathMatch) return null

    const filePath = pathMatch[1]
    const downloadUrl = `${host}/${filePath}`
    console.log(`[cloud-mail] CDP Fetch: ${downloadUrl}`)

    // Use CDP Fetch to download with browser cookies
    await cdp.send('Fetch.enable', { patterns: [{ urlPattern: '*' }] })

    // Navigate to the download URL — this triggers the download
    const response = await page.goto(downloadUrl, { timeout: 30_000, waitUntil: 'networkidle2' })

    if (response && response.status() === 200) {
      const buffer = await response.buffer()
      // Verify it's a valid ZIP/DOCX
      if (buffer.length > 1000 && buffer[0] === 0x50 && buffer[1] === 0x4B) {
        console.log(`[cloud-mail] CDP Fetch успешен: ${buffer.length} байт`)
        return buffer
      }
      console.warn(`[cloud-mail] CDP Fetch: ответ не DOCX (${buffer.length} байт, первые 2: ${buffer[0]},${buffer[1]})`)
    } else {
      console.warn(`[cloud-mail] CDP Fetch: HTTP ${response?.status()}`)
    }
  } catch (err) {
    console.warn(`[cloud-mail] CDP Fetch не удался: ${err}`)
  }

  return null
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
