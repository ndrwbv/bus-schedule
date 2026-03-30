/**
 * Download a file from a public Cloud Mail.ru share link using Puppeteer.
 *
 * Cloud Mail.ru opens .docx files in an online editor, so simple HTTP
 * requests no longer work (token API returns 403). Instead we launch
 * a real browser, open the share page, click "Download" and intercept
 * the resulting file.
 */

import puppeteer, { Page } from 'puppeteer-core'

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
        console.warn(`Попытка ${attempt}/${maxRetries} не удалась: ${lastError.message}. Повтор через ${delay}ms`)
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

  try {
    const page = await browser.newPage()

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    )

    // Listen for download responses — Cloud Mail.ru may serve the file
    // via a CDN response or via the docs editor download endpoint
    let fileBuffer: Buffer | null = null

    const cdp = await browser.target().createCDPSession()
    await cdp.send('Browser.setDownloadBehavior', {
      behavior: 'deny',
    })

    // Intercept responses that look like a .docx file
    page.on('response', async (response) => {
      if (fileBuffer) return
      const contentType = response.headers()['content-type'] ?? ''
      const contentDisposition = response.headers()['content-disposition'] ?? ''
      const isDocx =
        contentType.includes('officedocument') ||
        contentType.includes('octet-stream') ||
        contentDisposition.includes('attachment')

      if (isDocx && response.status() === 200) {
        try {
          const buffer = await response.buffer()
          // Validate it's actually a ZIP/DOCX (starts with PK magic bytes)
          if (buffer.length > 1000 && buffer[0] === 0x50 && buffer[1] === 0x4B) {
            console.log(`[cloud-mail] Перехвачен файл: ${response.url().slice(0, 100)}, ${buffer.length} байт, Content-Type: ${contentType}`)
            fileBuffer = buffer
          }
        } catch {
          // response may have been consumed already
        }
      }
    })

    // Open the share page
    await page.goto(shareUrl, { waitUntil: 'networkidle2', timeout: DOWNLOAD_TIMEOUT })

    // Wait for the page to fully render
    await sleep(3000)

    // Try to find and click the download button
    const downloaded = await tryClickDownload(page)

    if (downloaded) {
      // Wait for the download response to be intercepted
      const deadline = Date.now() + 30_000
      while (!fileBuffer && Date.now() < deadline) {
        await sleep(500)
      }
    }

    // If response interception didn't catch it, try to get the file
    // via the weblink_get CDN approach as a fallback
    if (!fileBuffer) {
      fileBuffer = await tryDirectDownload(page, shareUrl)
    }

    if (!fileBuffer) {
      // Save screenshot and page content for debugging
      const screenshotPath = process.cwd() + '/data/cloud-mail-debug.png'
      const htmlPath = process.cwd() + '/data/cloud-mail-debug.html'
      await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {})
      const html = await page.content().catch(() => '')
      if (html) {
        const fs = await import('node:fs')
        fs.writeFileSync(htmlPath, html, 'utf-8')
      }
      console.error(`[cloud-mail] Дебаг сохранён в ${screenshotPath} и ${htmlPath}`)
      throw new Error('Не удалось скачать файл: кнопка скачивания не найдена или файл не получен')
    }

    return fileBuffer
  } finally {
    await browser.close()
  }
}

/**
 * Try various selectors to find and click the download button.
 */
async function tryClickDownload(page: Page): Promise<boolean> {
  const selectors = [
    // Cloud Mail.ru known download button
    'a[href="#btn-download"]',
    '[href="#btn-download"]',
    // Common Cloud Mail.ru download button selectors
    'button[data-qa="download"]',
    'a[data-qa="download"]',
    '[data-testid="download"]',
    'button[title="Скачать"]',
    'a[title="Скачать"]',
    // Generic: button/link containing "Скачать" text
    'xpath/.//button[contains(., "Скачать")]',
    'xpath/.//a[contains(., "Скачать")]',
    'xpath/.//span[contains(., "Скачать")]/ancestor::button',
    // Toolbar buttons
    '.b-toolbar__btn[data-name="download"]',
    '.file-actions__download',
  ]

  for (const selector of selectors) {
    try {
      const el = await page.$(selector)
      if (el) {
        await el.click()
        console.log(`[cloud-mail] Нажата кнопка скачивания: ${selector}`)
        return true
      }
    } catch {
      // selector not found, try next
    }
  }

  // Fallback: try clicking any element with download-related text
  try {
    const clicked = await page.evaluate(`(function() {
      var elements = document.querySelectorAll('button, a, [role="button"]');
      for (var i = 0; i < elements.length; i++) {
        var text = elements[i].innerText ? elements[i].innerText.trim() : '';
        if (/скачать|download/i.test(text)) {
          elements[i].click();
          return true;
        }
      }
      return false;
    })()`)
    if (clicked) {
      console.log('[cloud-mail] Нажата кнопка скачивания (через evaluate)')
      return true
    }
  } catch {
    // ignore
  }

  console.warn('[cloud-mail] Кнопка скачивания не найдена')
  return false
}

/**
 * Fallback: try to extract CDN URL from page and download directly.
 */
async function tryDirectDownload(page: Page, shareUrl: string): Promise<Buffer | null> {
  try {
    // Try to extract weblink_get CDN host from page
    const result = await page.evaluate(`(function() {
      var html = document.documentElement.outerHTML;
      var match = html.match(/"weblink_get"\\s*:\\s*\\[\\s*"([^"]+)"/);
      return match ? match[1] : null;
    })()`) as string | null

    if (result) {
      const cdnHost = result.replace(/\/$/, '')
      const pathMatch = shareUrl.match(/\/public\/(.+)$/)
      if (pathMatch) {
        const filePath = pathMatch[1]
        const downloadUrl = `${cdnHost}/${filePath}`
        console.log(`[cloud-mail] Пробуем прямое скачивание: ${downloadUrl}`)

        const response = await page.goto(downloadUrl, { timeout: 30_000 })
        if (response && response.status() === 200) {
          const buffer = await response.buffer()
          if (buffer.length > 1000) {
            return buffer
          }
        }
      }
    }
  } catch (err) {
    console.warn(`[cloud-mail] Прямое скачивание не удалось: ${err}`)
  }

  return null
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
