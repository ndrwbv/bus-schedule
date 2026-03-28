export interface ISchedule {
  inSP: Record<string, Record<string, string[]>>
  out: Record<string, Record<string, string[]>>
  inLB: Record<string, Record<string, string[]>>
}

export interface ScheduleRecord {
  id: number
  data: string
  file_hash: string
  source_url: string | null
  parse_method: string
  file_type: string
  stops_count: number
  trips_count: number
  is_active: number
  created_at: string
  updated_at: string
}

export interface PipelineRunRecord {
  id: number
  trigger: string
  status: string
  error_message: string | null
  error_stage: string | null
  parse_method: string | null
  file_hash: string | null
  duration_ms: number | null
  created_at: string
}

export type PipelineTrigger = 'cron' | 'manual' | 'api'
export type PipelineStatus = 'running' | 'success' | 'no_changes' | 'error'
export type PipelineStage = 'scrape' | 'download' | 'parse' | 'validate' | 'save'
