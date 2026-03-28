import crypto from 'crypto'
import fs from 'fs'
import path from 'path'

export function getRawFilesPath(): string {
  return process.env.RAW_FILES_PATH || path.join(process.cwd(), 'data/raw_files')
}

export function computeHash(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex')
}

export function saveRawFile(buffer: Buffer, hash: string): string {
  const dir = getRawFilesPath()
  fs.mkdirSync(dir, { recursive: true })
  const filename = `schedule_${hash.slice(0, 8)}_${Date.now()}.docx`
  const filePath = path.join(dir, filename)
  fs.writeFileSync(filePath, buffer)
  return filePath
}
