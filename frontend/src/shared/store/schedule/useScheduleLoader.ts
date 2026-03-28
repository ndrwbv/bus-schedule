import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { getCachedSchedule, setCachedSchedule, useGetScheduleQuery } from 'shared/api/scheduleApi'

import { setScheduleFromApi } from './scheduleSlice'

/**
 * Загружает расписание по цепочке:
 * 1. localStorage (< 24ч) → dispatch немедленно
 * 2. GET /api/schedule → dispatch + записать в localStorage
 * 3. Если API недоступен → остаётся то, что загружено на шаге 1
 * 4. Если localStorage пуст → остаётся захардкоженный SCHEDULE из initialState
 */
export function useScheduleLoader(): void {
	const dispatch = useDispatch()

	// Step 1: Load from cache immediately on mount
	useEffect(() => {
		const cached = getCachedSchedule()
		if (cached) {
			dispatch(
				setScheduleFromApi({
					schedule: cached.schedule,
					source: `cache`,
					updatedAt: cached.meta.updatedAt,
					parseMethod: cached.meta.parseMethod,
				}),
			)
		}
	}, [dispatch])

	// Step 2: Fetch from API (RTK Query handles caching/deduplication)
	const { data } = useGetScheduleQuery()

	useEffect(() => {
		if (!data) return
		setCachedSchedule(data)
		dispatch(
			setScheduleFromApi({
				schedule: data.schedule,
				source: `api`,
				updatedAt: data.meta.updatedAt,
				parseMethod: data.meta.parseMethod,
			}),
		)
	}, [data, dispatch])
}
