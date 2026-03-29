import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { calculateHowMuchIsLeft } from 'shared/lib/time/calculateHowMuchIsLeft'
import { findClosesTime } from 'shared/lib/time/findClosesTime'
import { filterFutureTaggedTimes } from 'shared/lib/time/filterFutureTaggedTimes'
import useSecondMinuteUpdater from 'shared/store/timeLeft/useEverySecondUpdater'

import { busStopSelector, userDirectionSelector } from '../busStop/busStopInfoSlice'
import { getScheduleTimes } from '../busStop/const/stops'
import { currentDaySelector, scheduleSelector } from '../schedule/scheduleSlice'
import { closestTimeSelector, setClosestTime, setClosestTimeArray, setLeft } from './timeLeftSlice'

export const useTimeLeftUpdater = (): void => {
	const busStop = useSelector(busStopSelector)
	const userDirection = useSelector(userDirectionSelector)
	const currentDayKey = useSelector(currentDaySelector)
	const closestTime = useSelector(closestTimeSelector)
	const shedule = useSelector(scheduleSelector)

	const dispatch = useDispatch()
	const everySecondUpdate = useSecondMinuteUpdater()

	useEffect(() => {
		if (!busStop) return

		const allTimes = getScheduleTimes(shedule, userDirection, currentDayKey, busStop)
		const plainTimes = allTimes.map(t => t.time)
		const closestTimeToSet = findClosesTime(plainTimes)

		if (!closestTime || new Date(closestTime).getTime() !== new Date(closestTimeToSet || ``).getTime()) {
			const futureTimes = filterFutureTaggedTimes(allTimes)
			dispatch(setClosestTimeArray(futureTimes))
			dispatch(setClosestTime({ time: closestTimeToSet || ``, via: futureTimes[0]?.via ?? null }))
		}
	}, [everySecondUpdate, closestTime, busStop, userDirection, shedule, currentDayKey, dispatch])

	// calculation how much left
	useEffect(() => {
		const left = calculateHowMuchIsLeft(closestTime)

		dispatch(setLeft(left))
	}, [closestTime, dispatch])
}
