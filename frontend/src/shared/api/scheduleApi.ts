import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { ISchedule } from 'shared/store/schedule/ISchedule'

const API_BASE = import.meta.env.VITE_API_URL || `/api`

const CACHE_KEY = `severbus:schedule`
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

export interface ScheduleMeta {
	updatedAt: string
	lastCheckedAt: string
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

export interface ChangelogEntry {
	id: number
	createdAt: string
	summary: string
	parseMethod: string
	diff: {
		added: { direction: string; day: string; stop: string; times: string[] }[]
		removed: { direction: string; day: string; stop: string; times: string[] }[]
		changed: { direction: string; day: string; stop: string; before: string[]; after: string[] }[]
	}
}

export interface ChangelogResponse {
	items: ChangelogEntry[]
	total: number
	limit: number
	offset: number
}

export interface LiveBusPosition {
	lat: number
	lng: number
	description: string
}

export interface LiveResponse {
	buses: LiveBusPosition[]
	cachedAt: number
}

export interface BannerMessage {
	id: number
	author_name: string
	message: string
	amount: number | null
	created_at: string
}

export interface BannerMessagesResponse {
	messages: BannerMessage[]
}

export type FeaturesResponse = Record<string, boolean>

export const scheduleApi = createApi({
	reducerPath: `scheduleApi`,
	baseQuery: fetchBaseQuery({ baseUrl: API_BASE }),
	endpoints: builder => ({
		getSchedule: builder.query<ScheduleApiResponse, void>({
			query: () => `/schedule`,
		}),
		getChangelog: builder.query<ChangelogResponse, { limit?: number; offset?: number } | void>({
			query: params => {
				const limit = params ? params.limit ?? 5 : 5
				const offset = params ? params.offset ?? 0 : 0

				return `/schedule/changelog?limit=${limit}&offset=${offset}`
			},
		}),
		getLive: builder.query<LiveResponse, void>({
			query: () => `/live`,
		}),
		getFeatures: builder.query<FeaturesResponse, void>({
			query: () => `/features`,
		}),
		getBannerMessages: builder.query<BannerMessagesResponse, void>({
			query: () => `/banner-messages`,
		}),
	}),
})

export const {
	useGetScheduleQuery,
	useGetChangelogQuery,
	useGetLiveQuery,
	useGetFeaturesQuery,
	useGetBannerMessagesQuery,
} = scheduleApi

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
