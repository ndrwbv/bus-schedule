/**
 * Download a file from a public Cloud Mail.ru share link using Puppeteer.
 *
 * Cloud Mail.ru opens .docx files in an online editor (docs.datacloudmail.ru)
 * inside an iframe. The download button (SVG with #btn-download) lives inside
 * that iframe, so we need to:
 * 1. Open the share page and wait ~60s for the SPA editor to fully load
 * 2. Find the editor iframe (docs.datacloudmail.ru)
 * 3. Click the download SVG button inside the iframe
 * 4. Wait for the file to appear in the download directory
 */

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import puppeteer, { Frame, Page } from 'puppeteer-core'

const MAX_RETRIES = () => parseInt(process.env.DOWNLOAD_MAX_RETRIES ?? '3', 10)
/** How long to wait for the SPA editor to fully load (ms) */
const EDITOR_LOAD_WAIT = parseInt(process.env.CLOUD_MAIL_LOAD_WAIT ?? '60000', 10)

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
      '--disable-blink-features=AutomationControlled',
    ],
    ignoreDefaultArgs: ['--enable-automation'],
  })

  const downloadDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cloud-mail-'))
  console.log(`[cloud-mail] Папка загрузки: ${downloadDir}`)

  try {
    const page = await browser.newPage()

    // Anti-detection
    await page.evaluateOnNewDocument(
      `Object.defineProperty(navigator, 'webdriver', { get: () => false })`,
    )

    await page.setUserAgent(
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    )

    // CDP: allow downloads to temp dir
    const cdp = await page.createCDPSession()
    await cdp.send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: downloadDir,
    })

    // Open the share page
    console.log(`[cloud-mail] Открываем: ${shareUrl}`)
    await page.goto(shareUrl, { waitUntil: 'load', timeout: 180_000 })

    // Wait for the SPA editor to fully load (Cloud Mail.ru shows loaders for a long time)
    const waitSec = Math.round(EDITOR_LOAD_WAIT / 1000)
    console.log(`[cloud-mail] Ждём ${waitSec}с пока SPA редактор загрузится...`)
    await sleep(EDITOR_LOAD_WAIT)

    // ── Strategy 1: find download button inside the editor iframe ──
    const editorFrame = findEditorFrame(page)

    if (editorFrame) {
      console.log(`[cloud-mail] Найден фрейм редактора: ${editorFrame.url().substring(0, 80)}`)
      const clicked = await tryClickDownloadInFrame(editorFrame)

      if (clicked) {
        const filePath = await waitForDownload(downloadDir, 45_000)
        if (filePath) {
          console.log(`[cloud-mail] Файл скачан: ${filePath}`)
          const buffer = fs.readFileSync(filePath)
          validateDocx(buffer)
          return buffer
        }
        console.warn('[cloud-mail] Кнопка нажата, но файл не появился в папке загрузки')
      }
    } else {
      console.warn('[cloud-mail] Фрейм редактора (docs.datacloudmail.ru) не найден')
    }

    // ── Strategy 2: try clicking in the main page (old layout / fallback) ──
    console.log('[cloud-mail] Пробуем найти кнопку в основном документе...')
    const clickedMain = await tryClickDownloadInFrame(page.mainFrame())
    if (clickedMain) {
      const filePath = await waitForDownload(downloadDir, 45_000)
      if (filePath) {
        console.log(`[cloud-mail] Файл скачан (основной документ): ${filePath}`)
        const buffer = fs.readFileSync(filePath)
        validateDocx(buffer)
        return buffer
      }
    }

    // Save debug info
    const debugDir = process.cwd() + '/data'
    fs.mkdirSync(debugDir, { recursive: true })
    await page.screenshot({ path: `${debugDir}/cloud-mail-debug.png` }).catch(() => {})
    const html = await page.content().catch(() => '')
    if (html) fs.writeFileSync(`${debugDir}/cloud-mail-debug.html`, html, 'utf-8')

    // Also save iframe content if available
    if (editorFrame) {
      const iframeHtml = await editorFrame.content().catch(() => '')
      if (iframeHtml) fs.writeFileSync(`${debugDir}/cloud-mail-iframe-debug.html`, iframeHtml, 'utf-8')
    }

    console.error(`[cloud-mail] Дебаг сохранён в ${debugDir}/cloud-mail-debug.*`)
    throw new Error('Не удалось скачать файл: кнопка скачивания не найдена или файл не получен')
  } finally {
    await browser.close()
    fs.rmSync(downloadDir, { recursive: true, force: true })
  }
}

/**
 * Find the editor iframe (docs.datacloudmail.ru) on the page.
 */
function findEditorFrame(page: Page): Frame | undefined {
  return page.frames().find(f => f.url().includes('docs.datacloudmail.ru'))
}

/**
 * Try to click the download button inside a frame.
 * The button is an SVG: <svg class="... btn-download"><use href="#btn-download"></svg>
 * wrapped in a <button class="btn btn-header">
 */
async function tryClickDownloadInFrame(frame: Frame): Promise<boolean> {
  // Method 1: click the SVG with use[href="#btn-download"] via dispatchEvent
  try {
    const clicked = await frame.evaluate(`(function() {
      var use = document.querySelector('use[href="#btn-download"]');
      if (use) {
        var svg = use.closest('svg');
        if (svg) {
          svg.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
          return 'svg-use';
        }
      }
      var svg2 = document.querySelector('svg.btn-download');
      if (svg2) {
        svg2.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        return 'svg-class';
      }
      return false;
    })()`)
    if (clicked) {
      console.log(`[cloud-mail] Нажата кнопка в iframe: ${clicked}`)
      return true
    }
  } catch { /* continue */ }

  // Method 2: click the parent button of the SVG
  try {
    const clicked = await frame.evaluate(`(function() {
      var use = document.querySelector('use[href="#btn-download"]');
      if (!use) return false;
      var svg = use.closest('svg');
      if (!svg) return false;
      var el = svg;
      for (var i = 0; i < 5; i++) {
        el = el.parentElement;
        if (!el) return false;
        if (el.tagName === 'BUTTON' || el.tagName === 'A') {
          el.click();
          return 'parent-' + el.tagName;
        }
      }
      return false;
    })()`)
    if (clicked) {
      console.log(`[cloud-mail] Нажата кнопка (родитель SVG): ${clicked}`)
      return true
    }
  } catch { /* continue */ }

  // Method 3: find slot-hbtn-download and click its child button
  try {
    const clicked = await frame.evaluate(`(function() {
      var slot = document.querySelector('#slot-hbtn-download');
      if (slot) {
        var btn = slot.querySelector('button') || slot;
        btn.click();
        return 'slot-hbtn-download';
      }
      return false;
    })()`)
    if (clicked) {
      console.log(`[cloud-mail] Нажата кнопка: ${clicked}`)
      return true
    }
  } catch { /* continue */ }

  // Method 4: old-style selectors (for non-editor pages)
  const selectors = [
    'a[href="#btn-download"]',
    'button[data-qa="download"]',
    'a[data-qa="download"]',
    'button[title="Скачать"]',
    'a[title="Скачать"]',
  ]
  for (const selector of selectors) {
    try {
      const el = await frame.$(selector)
      if (el) {
        await el.click()
        console.log(`[cloud-mail] Нажата кнопка: ${selector}`)
        return true
      }
    } catch { /* try next */ }
  }

  console.warn('[cloud-mail] Кнопка скачивания не найдена')
  return false
}

/**
 * Wait for a file to appear in the download directory.
 */
async function waitForDownload(dir: string, timeoutMs: number): Promise<string | null> {
  const deadline = Date.now() + timeoutMs

  while (Date.now() < deadline) {
    const files = fs.readdirSync(dir)
    const ready = files.filter(f => !f.endsWith('.crdownload') && !f.startsWith('.'))

    if (ready.length > 0) {
      const filePath = path.join(dir, ready[0])
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
 * Validate that the buffer is a valid DOCX (ZIP) file.
 */
function validateDocx(buffer: Buffer): void {
  if (buffer.length < 100) {
    throw new Error(`Файл слишком маленький: ${buffer.length} байт`)
  }
  if (buffer[0] !== 0x50 || buffer[1] !== 0x4B) {
    throw new Error(`Файл не является DOCX/ZIP (magic bytes: 0x${buffer[0].toString(16)} 0x${buffer[1].toString(16)})`)
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
