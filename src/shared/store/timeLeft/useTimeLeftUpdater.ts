import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { calculateHowMuchIsLeft, findClosesTime, findClosesTimeArray } from 'widget/Schedule/helpers/schedule'
import useSecondMinuteUpdater from 'widget/Schedule/helpers/useSecondMinuteUpdater'
import { busStopSelector, directionSelector } from '../busStop/busStopInfoSlice'
import { currentDaySelector, scheduleSelector } from '../schedule/scheduleSlice'
import { closestTimeSelector, setClosestTime, setClosestTimeArray, setLeft } from './timeLeftSlice'

export const useTimeLeftUpdater = () => {
	const busStop = useSelector(busStopSelector)
	const direction = useSelector(directionSelector)
	const currentDayKey = useSelector(currentDaySelector)
	const closestTime = useSelector(closestTimeSelector)
	const shedule = useSelector(scheduleSelector)

	const dispatch = useDispatch()
	const _everyMinuteUpdate = useSecondMinuteUpdater()

	// finding closest time
	useEffect(() => {
		if (!busStop) return

		const _closestTime = findClosesTime(shedule[direction][currentDayKey][busStop])

		if (!closestTime || new Date(closestTime).getTime() !== new Date(_closestTime || '').getTime()) {
			dispatch(setClosestTimeArray(findClosesTimeArray(shedule[direction][currentDayKey][busStop])))
			dispatch(setClosestTime(_closestTime || ''))
		}
	}, [_everyMinuteUpdate, closestTime, busStop, direction, shedule, currentDayKey])

	// calculation how much left
	useEffect(() => {
		const left = calculateHowMuchIsLeft(closestTime)

		dispatch(setLeft(left))
	}, [_everyMinuteUpdate, closestTime])
}
