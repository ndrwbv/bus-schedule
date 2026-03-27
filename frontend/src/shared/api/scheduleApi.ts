import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { ISchedule } from 'shared/store/schedule/ISchedule'

// В Vite env-переменные доступны через import.meta.env, но vite.config.ts также экспортирует process.env
const API_BASE = (import.meta as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL || '/api'

const CACHE_KEY = 'severbus:schedule'
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

export interface ScheduleMeta {
	updatedAt: string
	parseMethod: string
	fileHash: string
}

export interface ScheduleApiResponse {
	schedule: ISchedule
	meta: ScheduleMeta
}

export interface CachedSchedule {
	schedule: ISchedule
	meta: ScheduleMeta
	cachedAt: number
}

export const scheduleApi = createApi({
	reducerPath: 'scheduleApi',
	baseQuery: fetchBaseQuery({ baseUrl: API_BASE }),
	endpoints: builder => ({
		getSchedule: builder.query<ScheduleApiResponse, void>({
			query: () => '/schedule',
		}),
	}),
})

export const { useGetScheduleQuery } = scheduleApi

// ─── localStorage cache helpers ──────────────────────────────────────────────

export function getCachedSchedule(): CachedSchedule | null {
	try {
		const raw = localStorage.getItem(CACHE_KEY)
		if (!raw) return null
		const cached = JSON.parse(raw) as CachedSchedule
		if (Date.now() - cached.cachedAt > CACHE_TTL_MS) return null
		return cached
	} catch {
		return null
	}
}

export function setCachedSchedule(data: ScheduleApiResponse): void {
	try {
		const cached: CachedSchedule = { ...data, cachedAt: Date.now() }
		localStorage.setItem(CACHE_KEY, JSON.stringify(cached))
	} catch {
		// localStorage quota exceeded or unavailable — ignore
	}
}
