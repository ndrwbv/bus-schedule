import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit'

import { setBusStop, setBusStopNew } from './busStopInfoSlice'
import { AllStopsOptions } from './const/stops'
import { StopKeys } from './Stops'

/**
 * Which stops the user actually picks, so the stop picker can show them first.
 * Per-device convenience — lives in localStorage and silently resets if storage is unavailable.
 */

const STORAGE_KEY = `severbus:stopUsage`
const KNOWN_LABELS = new Set(AllStopsOptions.map(o => o.value).filter(Boolean))

interface StopUsage {
	count: number
	lastUsedAt: number
}

type StopUsageMap = Partial<Record<StopKeys, StopUsage>>

const readStopUsage = (): StopUsageMap => {
	try {
		const raw = localStorage.getItem(STORAGE_KEY)

		return raw ? (JSON.parse(raw) as StopUsageMap) : {}
	} catch {
		return {}
	}
}

export const recordStopUsage = (label: StopKeys): void => {
	try {
		const usage = readStopUsage()
		const prev = usage[label]
		usage[label] = { count: (prev?.count ?? 0) + 1, lastUsedAt: Date.now() }
		localStorage.setItem(STORAGE_KEY, JSON.stringify(usage))
	} catch {
		// storage unavailable (private mode, quota) — ordering just stays default
	}
}

/** Most used stops first, ties broken by the most recent one */
export const getFrequentStops = (limit: number): StopKeys[] => {
	const usage = readStopUsage()

	return (Object.keys(usage) as StopKeys[])
		.filter(label => KNOWN_LABELS.has(label))
		.sort((a, b) => {
			const ua = usage[a] as StopUsage
			const ub = usage[b] as StopUsage

			return ub.count - ua.count || ub.lastUsedAt - ua.lastUsedAt
		})
		.slice(0, limit)
}

/** Records every stop selection, wherever it came from: picker, map pin, favourites, nearest stops, link */
export const stopUsageListener = createListenerMiddleware()

stopUsageListener.startListening({
	matcher: isAnyOf(setBusStop, setBusStopNew),
	effect: (_action, api) => {
		const state = api.getState() as { busStopInfo: { busStop: StopKeys | null } }
		const label = state.busStopInfo.busStop

		if (label) recordStopUsage(label)
	},
})
