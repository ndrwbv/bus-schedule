import AdmZip from 'adm-zip'
import { XMLParser } from 'fast-xml-parser'
import { mapStopName, isExcludedStop } from './stopMapper'
import { ISchedule } from './types'

// ─── XML types ────────────────────────────────────────────────────────────────

interface WRun {
  'w:rPr'?: { 'w:vertAlign'?: { '@_w:val': string } }
  'w:t'?: string | { '#text': string; '@_xml:space'?: string }
}

interface WParagraph {
  'w:r'?: WRun | WRun[]
}

interface WCell {
  'w:tcPr'?: {
    'w:gridSpan'?: { '@_w:val': string }
    'w:vMerge'?: { '@_w:val'?: string } | ''
  }
  'w:p'?: WParagraph | WParagraph[]
}

interface WRow {
  'w:tc'?: WCell | WCell[]
}

interface WTable {
  'w:tr'?: WRow | WRow[]
}

// ─── Cell data ─────────────────────────────────────────────────────────────────

interface CellData {
  text: string
  hasSuperscript: boolean
  colSpan: number
  isVMergeCont: boolean // vMerge without val="restart" (continuation row)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toArray<T>(v: T | T[] | undefined): T[] {
  if (v === undefined || v === null) return []
  return Array.isArray(v) ? v : [v]
}

function getRunText(run: WRun): string {
  const t = run['w:t']
  if (!t) return ''
  if (typeof t === 'string') return t
  return t['#text'] ?? ''
}

function runHasSuperscript(run: WRun): boolean {
  return run['w:rPr']?.['w:vertAlign']?.['@_w:val'] === 'superscript'
}

function extractCell(tc: WCell): CellData {
  const tcPr = tc['w:tcPr']
  const colSpan = tcPr?.['w:gridSpan']
    ? parseInt(tcPr['w:gridSpan']['@_w:val'] ?? '1', 10)
    : 1

  // vMerge with val="restart" → starts a merged block (treat as normal cell)
  // vMerge without val (or empty object) → continuation, skip
  let isVMergeCont = false
  if (tcPr?.['w:vMerge'] !== undefined) {
    const vm = tcPr['w:vMerge']
    const vmVal = typeof vm === 'object' && vm !== null ? (vm as { '@_w:val'?: string })['@_w:val'] : undefined
    isVMergeCont = vmVal !== 'restart'
  }

  let text = ''
  let hasSuperscript = false

  for (const para of toArray(tc['w:p'])) {
    for (const run of toArray(para['w:r'])) {
      text += getRunText(run)
      if (runHasSuperscript(run)) hasSuperscript = true
    }
  }

  return { text: text.trim(), hasSuperscript, colSpan, isVMergeCont }
}

function tableToGrid(table: WTable): CellData[][] {
  const rows = toArray(table['w:tr'])
  return rows.map((row) => toArray(row['w:tc']).map(extractCell))
}

// ─── Time conversion ──────────────────────────────────────────────────────────

function convertTime(raw: string): string | null {
  // Accept "06-15", "06:15", "6:15"
  const normalized = raw.trim().replace('-', ':')
  const m = normalized.match(/^(\d{1,2}):(\d{2})$/)
  if (!m) return null
  const h = parseInt(m[1], 10)
  const min = parseInt(m[2], 10)
  if (h < 0 || h > 23 || min < 0 || min > 59) return null
  return `${h}:${m[2]}`
}

// ─── Table processing ─────────────────────────────────────────────────────────

/**
 * Find the row index that acts as a section divider (second "Остановочный пункт" header).
 * Returns -1 if not found.
 */
function findDividerRow(grid: CellData[][]): number {
  let headerCount = 0
  for (let i = 0; i < grid.length; i++) {
    const firstCell = grid[i][0]
    if (firstCell && firstCell.text.toLowerCase().includes('остановочный пункт')) {
      headerCount++
      if (headerCount === 2) return i
    }
  }
  return -1
}

/**
 * Find the trip numbers row (contains "1", "2", ... or similar short numeric cells).
 * Typically row index 2.
 */
function findTripNumbersRow(grid: CellData[][]): number {
  // Row 2 by convention; search for it dynamically as fallback
  if (grid.length > 2) return 2
  return -1
}

/**
 * Determine which column indices correspond to inLB trips.
 * Col 0 is the stop name column.
 */
function findInLBColumns(tripRow: CellData[]): Set<number> {
  const inLB = new Set<number>()
  for (let col = 1; col < tripRow.length; col++) {
    if (tripRow[col].hasSuperscript) {
      inLB.add(col)
    }
  }
  return inLB
}

interface HalfTable {
  rows: CellData[][] // rows excluding the header row itself
  tripNumbersRow: CellData[]
  inLBCols: Set<number>
}

/**
 * Split the grid into inbound (inSP/inLB) and outbound (out) halves.
 * Returns [inbound, outbound].
 */
function splitTable(grid: CellData[][]): [HalfTable, HalfTable] {
  const divider = findDividerRow(grid)
  const tripRow = findTripNumbersRow(grid)
  const tripNumbersRow = tripRow >= 0 ? grid[tripRow] : []
  const inLBCols = findInLBColumns(tripNumbersRow)

  // Inbound: rows from after first header (row 0) up to divider (exclusive)
  // Data rows start at index 3 (0=header, 1=subheader, 2=trip numbers)
  const inboundRows = grid.slice(3, divider >= 0 ? divider : undefined)

  // Outbound: rows after divider
  const outboundRows = divider >= 0 ? grid.slice(divider + 1) : []

  return [
    { rows: inboundRows, tripNumbersRow, inLBCols },
    { rows: outboundRows, tripNumbersRow, inLBCols },
  ]
}

type DayStops = Record<string, string[]>

/**
 * Build stop→times maps for inSP and inLB from the inbound half.
 */
function buildInbound(
  half: HalfTable,
): { inSP: DayStops; inLB: DayStops } {
  const inSP: DayStops = {}
  const inLB: DayStops = {}

  for (const row of half.rows) {
    if (row.length === 0) continue
    const rawStop = row[0]?.text ?? ''
    if (!rawStop || rawStop.toLowerCase().includes('остановочный')) continue
    if (isExcludedStop(rawStop)) continue

    const stopName = mapStopName(rawStop)

    for (let col = 1; col < row.length; col++) {
      const cell = row[col]
      if (!cell) continue
      const time = convertTime(cell.text)
      if (!time || time === '-') continue

      if (half.inLBCols.has(col)) {
        if (!inLB[stopName]) inLB[stopName] = []
        inLB[stopName].push(time)
      } else {
        if (!inSP[stopName]) inSP[stopName] = []
        inSP[stopName].push(time)
      }
    }
  }

  return { inSP, inLB }
}

/**
 * Build stop→times map for outbound direction.
 */
function buildOutbound(half: HalfTable): DayStops {
  const out: DayStops = {}

  for (const row of half.rows) {
    if (row.length === 0) continue
    const rawStop = row[0]?.text ?? ''
    if (!rawStop || rawStop.toLowerCase().includes('остановочный')) continue
    if (isExcludedStop(rawStop)) continue

    const stopName = mapStopName(rawStop)

    for (let col = 1; col < row.length; col++) {
      const cell = row[col]
      if (!cell) continue
      const time = convertTime(cell.text)
      if (!time) continue

      if (!out[stopName]) out[stopName] = []
      out[stopName].push(time)
    }
  }

  return out
}

/**
 * Merge two DayStops objects (used to combine table 0 and table 1 for weekdays).
 * Times are appended and then sorted.
 */
function mergeAndSort(a: DayStops, b: DayStops): DayStops {
  const result: DayStops = { ...a }
  for (const [stop, times] of Object.entries(b)) {
    if (!result[stop]) {
      result[stop] = [...times]
    } else {
      result[stop] = [...result[stop], ...times]
    }
  }
  // Sort times within each stop
  for (const stop of Object.keys(result)) {
    result[stop].sort((a, b) => {
      const toMin = (t: string) => {
        const [h, m] = t.split(':').map(Number)
        return h * 60 + m
      }
      return toMin(a) - toMin(b)
    })
  }
  return result
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Parse a .docx buffer into ISchedule.
 *
 * Table mapping:
 *   Table 0 + Table 1 → weekdays (days '1'–'5')
 *   Table 2           → Saturday (day '6')
 *   Table 3           → Sunday (day '0')
 */
export function parseDocx(buffer: Buffer): ISchedule {
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
  if (!body) throw new Error('Не найден w:document/w:body в XML')

  const tables: WTable[] = toArray(body['w:tbl'])
  if (tables.length < 4) {
    throw new Error(`Ожидалось 4 таблицы, найдено ${tables.length}`)
  }

  const grids = tables.map(tableToGrid)

  // Process Table 0 (first half of weekdays)
  const [inbound0, outbound0] = splitTable(grids[0])
  const ib0 = buildInbound(inbound0)
  const ob0 = buildOutbound(outbound0)

  // Process Table 1 (second half of weekdays)
  const [inbound1, outbound1] = splitTable(grids[1])
  const ib1 = buildInbound(inbound1)
  const ob1 = buildOutbound(outbound1)

  // Merge weekday tables
  const weekdayInSP = mergeAndSort(ib0.inSP, ib1.inSP)
  const weekdayInLB = mergeAndSort(ib0.inLB, ib1.inLB)
  const weekdayOut = mergeAndSort(ob0, ob1)

  // Process Table 2 (Saturday)
  const [inbound2, outbound2] = splitTable(grids[2])
  const ib2 = buildInbound(inbound2)
  const ob2 = buildOutbound(outbound2)

  // Process Table 3 (Sunday)
  const [inbound3, outbound3] = splitTable(grids[3])
  const ib3 = buildInbound(inbound3)
  const ob3 = buildOutbound(outbound3)

  const weekdays = ['1', '2', '3', '4', '5']

  const schedule: ISchedule = {
    inSP: {},
    out: {},
    inLB: {},
  }

  for (const day of weekdays) {
    schedule.inSP[day] = weekdayInSP
    schedule.out[day] = weekdayOut
    schedule.inLB[day] = weekdayInLB
  }

  schedule.inSP['6'] = ib2.inSP
  schedule.out['6'] = ob2
  schedule.inLB['6'] = ib2.inLB

  schedule.inSP['0'] = ib3.inSP
  schedule.out['0'] = ob3
  schedule.inLB['0'] = ib3.inLB

  return schedule
}
