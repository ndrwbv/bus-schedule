import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { getCachedSchedule, setCachedSchedule, useGetScheduleQuery } from 'shared/api/scheduleApi'
import { ISchedule } from 'shared/store/schedule/ISchedule'

import { setScheduleFromApi } from './scheduleSlice'

/** Defensive check: only accept payloads with the expected 3-direction shape. */
function isValidSchedule(s: unknown): s is ISchedule {
	if (!s || typeof s !== `object`) return false
	const obj = s as Record<string, unknown>

	return (
		obj.inSP !== null &&
		obj.out !== null &&
		obj.inLB !== null &&
		typeof obj.inSP === `object` &&
		typeof obj.out === `object` &&
		typeof obj.inLB === `object`
	)
}

/**
 * Загружает расписание по цепочке:
 * 1. localStorage (< 24ч) → dispatch немедленно
 * 2. GET /api/schedule → dispatch + записать в localStorage
 * 3. Если API недоступен → остаётся то, что загружено на шаге 1
 * 4. Если localStorage пуст → остаётся пустой initialState (scheduleSource === 'empty')
 *
 * Невалидные/битые payload'ы (схема не совпадает) молча отбрасываются — UI
 * просто продолжает показывать то, что уже есть в state.
 */
export function useScheduleLoader(): void {
	const dispatch = useDispatch()

	// Step 1: Load from cache immediately on mount
	useEffect(() => {
		const cached = getCachedSchedule()
		if (cached && isValidSchedule(cached.schedule)) {
			dispatch(
				setScheduleFromApi({
					schedule: cached.schedule,
					source: `cache`,
					updatedAt: cached.meta?.updatedAt ?? ``,
					lastCheckedAt: cached.meta?.lastCheckedAt ?? ``,
					parseMethod: cached.meta?.parseMethod ?? ``,
				}),
			)
		}
	}, [dispatch])

	// Step 2: Fetch from API (RTK Query handles caching/deduplication)
	const { data } = useGetScheduleQuery()

	useEffect(() => {
		if (!data || !isValidSchedule(data.schedule)) return
		setCachedSchedule(data)
		dispatch(
			setScheduleFromApi({
				schedule: data.schedule,
				source: `api`,
				updatedAt: data.meta?.updatedAt ?? ``,
				lastCheckedAt: data.meta?.lastCheckedAt ?? ``,
				parseMethod: data.meta?.parseMethod ?? ``,
			}),
		)
	}, [data, dispatch])
}
