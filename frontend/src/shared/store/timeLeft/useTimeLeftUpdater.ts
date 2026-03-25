import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { calculateHowMuchIsLeft } from 'shared/lib/time/calculateHowMuchIsLeft'
import { findClosesTime } from 'shared/lib/time/findClosesTime'
import { findClosesTimeArray } from 'shared/lib/time/findClosesTimeArray'
import useSecondMinuteUpdater from 'shared/store/timeLeft/useEverySecondUpdater'

import { busStopSelector, directionSelector } from '../busStop/busStopInfoSlice'
import { currentDaySelector, scheduleSelector } from '../schedule/scheduleSlice'
import { closestTimeSelector, setClosestTime, setClosestTimeArray, setLeft } from './timeLeftSlice'

export const useTimeLeftUpdater = (): void => {
	const busStop = useSelector(busStopSelector)
	const direction = useSelector(directionSelector)
	const currentDayKey = useSelector(currentDaySelector)
	const closestTime = useSelector(closestTimeSelector)
	const shedule = useSelector(scheduleSelector)

	const dispatch = useDispatch()
	const everySecondUpdate = useSecondMinuteUpdater()

	useEffect(() => {
		if (!busStop) return

		const closestTimeToSet = findClosesTime(shedule[direction][currentDayKey][busStop])

		if (!closestTime || new Date(closestTime).getTime() !== new Date(closestTimeToSet || ``).getTime()) {
			dispatch(setClosestTimeArray(findClosesTimeArray(shedule[direction][currentDayKey][busStop])))
			dispatch(setClosestTime(closestTimeToSet || ``))
		}
	}, [everySecondUpdate, closestTime, busStop, direction, shedule, currentDayKey, dispatch])

	// calculation how much left
	useEffect(() => {
		const left = calculateHowMuchIsLeft(closestTime)

		dispatch(setLeft(left))
	}, [closestTime, dispatch])
}
