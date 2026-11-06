import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { calculateHowMuchIsLeft } from 'shared/lib/time/calculateHowMuchIsLeft'
import { filterFutureTaggedTimes } from 'shared/lib/time/filterFutureTaggedTimes'
import { findClosesTime } from 'shared/lib/time/findClosesTime'
import useSecondMinuteUpdater from 'shared/store/timeLeft/useEverySecondUpdater'

import { busStopSelector, userDirectionSelector } from '../busStop/busStopInfoSlice'
import { getScheduleTimes } from '../busStop/const/stops'
import { currentDaySelector, scheduleSelector, serviceDateSelector } from '../schedule/scheduleSlice'
import { closestTimeSelector, setClosestTime, setClosestTimeArray, setLeft } from './timeLeftSlice'

export const useTimeLeftUpdater = (): void => {
	const busStop = useSelector(busStopSelector)
	const userDirection = useSelector(userDirectionSelector)
	const currentDayKey = useSelector(currentDaySelector)
	const serviceDate = useSelector(serviceDateSelector)
	const closestTime = useSelector(closestTimeSelector)
	const shedule = useSelector(scheduleSelector)

	const dispatch = useDispatch()
	const everySecondUpdate = useSecondMinuteUpdater()

	const allTimes = useMemo(
		() => (busStop ? getScheduleTimes(shedule, userDirection, currentDayKey, busStop, serviceDate) : []),
		[shedule, userDirection, currentDayKey, busStop, serviceDate],
	)
	useEffect(() => {
		const futureTimes = filterFutureTaggedTimes(allTimes)
		dispatch(setClosestTimeArray(futureTimes))
		dispatch(
			setClosestTime({
				time: findClosesTime(allTimes.map(item => item.time)) || ``,
				via: futureTimes[0]?.via ?? null,
				interpolated: futureTimes[0]?.interpolated,
				interpolatedFrom: futureTimes[0]?.interpolatedFrom,
			}),
		)
	}, [allTimes, everySecondUpdate, dispatch])

	// calculation how much left
	useEffect(() => {
		const left = calculateHowMuchIsLeft(closestTime)

		dispatch(setLeft(left))
	}, [closestTime, everySecondUpdate, dispatch])
}
