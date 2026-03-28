import AdmZip from 'adm-zip'
import { XMLParser } from 'fast-xml-parser'
import * as fs from 'fs'

const filePath = process.argv[2]
if (!filePath) {
  console.error('Usage: npx tsx scripts/debug-docx.ts <file.docx>')
  process.exit(1)
}

function toArray<T>(v: T | T[] | undefined): T[] {
  if (v === undefined || v === null) return []
  return Array.isArray(v) ? v : [v]
}

const buffer = fs.readFileSync(filePath)
const zip = new AdmZip(buffer)
const xmlContent = zip.readAsText('word/document.xml')

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  isArray: (name) =>
    ['w:tbl', 'w:tr', 'w:tc', 'w:p', 'w:r'].includes(name),
})

const doc = xmlParser.parse(xmlContent)
const body = doc?.['w:document']?.['w:body']
const tables = toArray(body['w:tbl'])

console.log(`Found ${tables.length} tables\n`)

for (let t = 0; t < tables.length; t++) {
  const rows = toArray(tables[t]['w:tr'])
  console.log(`=== Table ${t} (${rows.length} rows) ===`)

  for (let r = 0; r < rows.length; r++) {
    const cells = toArray(rows[r]['w:tc'])
    const cellTexts = cells.map((tc: any) => {
      const paras = toArray(tc['w:p'])
      let text = ''
      let hasSuperscript = false
      for (const p of paras) {
        for (const run of toArray(p['w:r'])) {
          const wt = run['w:t']
          if (wt) text += typeof wt === 'string' ? wt : wt['#text'] ?? ''
          if (run['w:rPr']?.['w:vertAlign']?.['@_w:val'] === 'superscript') hasSuperscript = true
        }
      }
      const sup = hasSuperscript ? '(*)' : ''
      return (text.trim() + sup).padEnd(20)
    })

    // Only show first cell + a summary
    const first = cellTexts[0]?.trim() || '(empty)'
    const rest = cellTexts.slice(1).map((c: string) => c.trim()).filter(Boolean)
    const timeish = rest.filter((c: string) => /^\d{1,2}[:\-]\d{2}/.test(c))

    if (timeish.length > 0) {
      console.log(`  Row ${r}: [${first}] times: ${timeish.join(', ')}`)
    } else {
      console.log(`  Row ${r}: [${first}] cells: ${rest.slice(0, 8).join(', ')}${rest.length > 8 ? '...' : ''}`)
    }
  }
  console.log()
}
