/**
 * Тестовый скрипт для отладки скачивания с Cloud Mail.ru.
 * Запуск: node test-download.mjs [URL]
 */
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
let shareUrl = process.argv[2] || 'https://cloud.mail.ru/public/YJGH/vLzFF48pJ'

console.log(`\nОткрываем: ${shareUrl}\n`)

const downloadDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cloud-mail-test-'))
console.log('Папка загрузки:', downloadDir)

const browser = await puppeteer.launch({
  headless: false,
  executablePath: CHROME_PATH,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-blink-features=AutomationControlled',
    '--window-size=1280,900',
  ],
  defaultViewport: { width: 1280, height: 900 },
  ignoreDefaultArgs: ['--enable-automation'],
})

const page = await browser.newPage()

await page.evaluateOnNewDocument(() => {
  Object.defineProperty(navigator, 'webdriver', { get: () => false })
})

await page.setUserAgent(
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
)

// CDP для скачивания
const cdp = await page.createCDPSession()
await cdp.send('Page.setDownloadBehavior', {
  behavior: 'allow',
  downloadPath: downloadDir,
})

// Логируем скачивания
page.on('response', async (response) => {
  const headers = response.headers()
  const url = response.url()
  if (headers['content-disposition'] || url.includes('weblink_get') || url.includes('attach')) {
    console.log(`\n  📥 [${response.status()}] ${url.substring(0, 150)}`)
    console.log(`     content-type: ${headers['content-type']}`)
    console.log(`     content-disposition: ${headers['content-disposition']}`)
    console.log(`     content-length: ${headers['content-length']}`)
  }
})

console.log('Навигация (таймаут 3 мин)...')
await page.goto(shareUrl, { waitUntil: 'load', timeout: 180_000 })

// ── Жёсткий кулдаун 60 сек ──
console.log('\nЖдём 60 секунд пока сайт полностью загрузится...')
for (let i = 1; i <= 60; i++) {
  await new Promise(r => setTimeout(r, 1000))
  if (i % 10 === 0) {
    console.log(`  ${i}с...`)
    await page.screenshot({ path: '/tmp/cloud-mail-page.png' })
  }
}
console.log('60 сек прошло.\n')

// Скриншот
await page.screenshot({ path: '/tmp/cloud-mail-page.png' })
console.log('Скриншот: /tmp/cloud-mail-page.png')

// ── Ищем iframe редактора ──
const frames = page.frames()
console.log(`\nВсего фреймов: ${frames.length}`)
for (const f of frames) {
  console.log(`  frame: ${f.url().substring(0, 120)}`)
}

// Находим фрейм редактора (docs.datacloudmail.ru)
const editorFrame = frames.find(f => f.url().includes('docs.datacloudmail.ru'))

if (editorFrame) {
  console.log(`\n✅ Нашли фрейм редактора: ${editorFrame.url().substring(0, 100)}`)

  // Сканируем содержимое iframe
  const iframeDiag = await editorFrame.evaluate(() => {
    // Ищем svg с #btn-download
    const svgDownload = document.querySelector('svg.btn-download, svg use[href="#btn-download"], [href="#btn-download"]')
    const hasSvgDownload = !!svgDownload
    let svgParent = null
    if (svgDownload) {
      // Поднимаемся к кликабельному родителю
      let el = svgDownload
      for (let i = 0; i < 5; i++) {
        el = el.parentElement
        if (!el) break
        if (el.tagName === 'BUTTON' || el.tagName === 'A' || el.classList.contains('btn-toolbar') || el.onclick) {
          svgParent = { tag: el.tagName, className: (el.className?.toString?.() || '').substring(0, 100), id: el.id }
          break
        }
      }
      if (!svgParent && svgDownload.closest) {
        const closest = svgDownload.closest('button, a, [role="button"], .btn-toolbar, .toolbar-btn, [class*="btn"]')
        if (closest) {
          svgParent = { tag: closest.tagName, className: (closest.className?.toString?.() || '').substring(0, 100), id: closest.id }
        }
      }
    }

    // Все элементы с "download" в классе
    const downloadEls = []
    const els = document.querySelectorAll('[class*="download"], [class*="Download"], [href*="download"], [href*="btn-download"]')
    for (const el of els) {
      downloadEls.push({
        tag: el.tagName,
        className: (el.className?.toString?.() || '').substring(0, 100),
        href: el.getAttribute?.('href'),
        id: el.id,
        parentTag: el.parentElement?.tagName,
        parentClass: (el.parentElement?.className?.toString?.() || '').substring(0, 80),
      })
    }

    // Все кнопки тулбара
    const toolbarBtns = []
    const btns = document.querySelectorAll('.toolbar-btn, .btn-toolbar, button, [role="button"], [class*="toolbar"] [class*="btn"]')
    for (const el of btns) {
      const text = (el.textContent?.trim() || '').substring(0, 40)
      const cls = (el.className?.toString?.() || '').substring(0, 80)
      const title = el.getAttribute?.('title') || ''
      toolbarBtns.push({ tag: el.tagName, text, className: cls, title, id: el.id })
    }

    return { hasSvgDownload, svgParent, downloadEls, toolbarBtns }
  })

  console.log(`\nSVG #btn-download найден: ${iframeDiag.hasSvgDownload}`)
  console.log(`SVG родитель: ${JSON.stringify(iframeDiag.svgParent)}`)

  console.log(`\n=== Элементы с "download" в iframe (${iframeDiag.downloadEls.length}) ===`)
  iframeDiag.downloadEls.forEach(e => console.log(`  <${e.tag}> class="${e.className}" href=${e.href} id="${e.id}" parent=<${e.parentTag}> "${e.parentClass}"`))

  console.log(`\n=== Кнопки тулбара в iframe (${iframeDiag.toolbarBtns.length}) ===`)
  iframeDiag.toolbarBtns.forEach(e => console.log(`  <${e.tag}> "${e.text}" title="${e.title}" class="${e.className}" id="${e.id}"`))

  // ── Пробуем нажать кнопку скачивания внутри iframe ──
  console.log('\n\n========== ПОПЫТКА СКАЧИВАНИЯ (iframe) ==========\n')

  let clicked = false

  // Способ 1: клик по SVG use[href="#btn-download"] или его родителю
  if (iframeDiag.hasSvgDownload) {
    console.log('Нажимаем SVG #btn-download...')
    clicked = await editorFrame.evaluate(() => {
      // Найдём use с href="#btn-download" и кликнем по ближайшему кликабельному родителю
      const use = document.querySelector('use[href="#btn-download"]')
      if (use) {
        // Поднимаемся к SVG, потом к его родителю
        let el = use.closest('svg')
        if (el) {
          // Кликаем по SVG
          el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
          return 'svg'
        }
      }
      // Попробуем саму svg с классом btn-download
      const svg = document.querySelector('svg.btn-download')
      if (svg) {
        svg.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
        return 'svg.btn-download'
      }
      return false
    })
    if (clicked) console.log(`✅ Кликнули: ${clicked}`)
  }

  // Способ 2: клик по родительскому элементу SVG
  if (!clicked) {
    console.log('Пробуем кликнуть по родителю SVG...')
    clicked = await editorFrame.evaluate(() => {
      const use = document.querySelector('use[href="#btn-download"]')
      if (!use) return false
      let el = use.closest('svg')
      if (!el) return false
      // Поднимаемся по DOM пока не найдём кликабельный элемент
      for (let i = 0; i < 8; i++) {
        el = el.parentElement
        if (!el) return false
        el.click()
        return `parent-${i}: ${el.tagName}.${el.className?.toString?.().substring(0, 40)}`
      }
      return false
    })
    if (clicked) console.log(`✅ Кликнули: ${clicked}`)
  }

  // Способ 3: Puppeteer click через координаты
  if (!clicked) {
    console.log('Пробуем клик через Puppeteer координаты...')
    const elHandle = await editorFrame.$('svg.btn-download, use[href="#btn-download"]')
    if (elHandle) {
      const box = await elHandle.boundingBox()
      if (box) {
        console.log(`  Координаты: x=${box.x}, y=${box.y}, w=${box.width}, h=${box.height}`)
        await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
        clicked = true
        console.log('✅ Кликнули через координаты')
      } else {
        console.log('  boundingBox() вернул null')
      }
    } else {
      console.log('  Элемент не найден в iframe')
    }
  }

  if (clicked) {
    // Ждём скачивания
    console.log('\nЖдём скачивания до 30 сек...')
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 1000))
      const files = fs.readdirSync(downloadDir)
      if (files.length > 0) {
        const ready = files.filter(f => !f.endsWith('.crdownload'))
        console.log(`  Файлы: ${files.join(', ')}`)
        if (ready.length > 0) {
          const filePath = path.join(downloadDir, ready[0])
          const stat = fs.statSync(filePath)
          console.log(`\n✅ СКАЧАН: ${ready[0]} (${stat.size} байт)`)
          const buf = fs.readFileSync(filePath)
          if (buf[0] === 0x50 && buf[1] === 0x4B) {
            console.log('✅ Валидный ZIP/DOCX')
          } else {
            console.log(`❌ Не ZIP/DOCX (magic: 0x${buf[0]?.toString(16)} 0x${buf[1]?.toString(16)})`)
          }
          break
        }
      }
    }
    const finalFiles = fs.readdirSync(downloadDir)
    if (finalFiles.length === 0) console.log('❌ Файл не скачался')
  } else {
    console.log('❌ Не удалось кликнуть по кнопке скачивания')
  }

} else {
  console.log('\n❌ Фрейм редактора (docs.datacloudmail.ru) НЕ найден')

  // Fallback: ищем в основном документе
  console.log('Ищем кнопку в основном документе...')
  const mainDiag = await page.evaluate(() => {
    const svgs = document.querySelectorAll('svg, use')
    return Array.from(svgs).map(el => ({
      tag: el.tagName,
      className: (el.className?.toString?.() || '').substring(0, 80),
      href: el.getAttribute?.('href'),
    })).filter(e => e.className || e.href)
  })
  console.log('SVG элементы:', mainDiag.length)
  mainDiag.forEach(e => console.log(`  <${e.tag}> class="${e.className}" href=${e.href}`))
}

await page.screenshot({ path: '/tmp/cloud-mail-after.png' })
console.log('\nФинальный скриншот: /tmp/cloud-mail-after.png')

console.log('\n\n⏸️  Браузер открыт. Ctrl+C чтобы закрыть.')
await new Promise(() => {})
