import { PipelineStage } from './types'

export type LogLevel = 'info' | 'warn' | 'error'

export interface PipelineLogEntry {
  level: LogLevel
  stage: PipelineStage | 'pipeline'
  message: string
  ts: string
}

const entries: PipelineLogEntry[] = []

function log(level: LogLevel, stage: PipelineStage | 'pipeline', message: string): void {
  const entry: PipelineLogEntry = { level, stage, message, ts: new Date().toISOString() }
  entries.push(entry)
  const prefix = `[${entry.ts}] [${stage}]`
  if (level === 'error') {
    console.error(`${prefix} ${message}`)
  } else if (level === 'warn') {
    console.warn(`${prefix} ${message}`)
  } else {
    console.log(`${prefix} ${message}`)
  }
}

export const pipelineLogger = {
  info: (stage: PipelineStage | 'pipeline', message: string) => log('info', stage, message),
  warn: (stage: PipelineStage | 'pipeline', message: string) => log('warn', stage, message),
  error: (stage: PipelineStage | 'pipeline', message: string) => log('error', stage, message),
  /** Получить все записи текущего запуска и сбросить буфер */
  flush: (): PipelineLogEntry[] => {
    const result = [...entries]
    entries.length = 0
    return result
  },
}
