import React, { useContext, createContext, useState, useEffect, useMemo } from 'react'

import { AndrewLytics } from 'shared/lib'
import { calculateHowMuchIsLeft, findClosesTime, findClosesTimeArray } from 'widget/Schedule/helpers/schedule'

import useSchedule from 'widget/Schedule/model/useSchedule'
import useEveryMinuteUpdater from 'widget/Schedule/helpers/useEveryMinuteUpdater'

import { ITime } from 'widget/Schedule/types/ITime'
import { useSelector } from 'react-redux'
import { busStopSelector, directionSelector } from '../../../shared/store/busStop/busStopInfoSlice'
import { currentDaySelector } from 'shared/store/schedule/scheduleSlice'

const DEFAULT_LEFT = {
	hours: 0,
	minutes: 0,
}

const DEFAULT_PROPS = {
	left: DEFAULT_LEFT,
	closestTimeArray: [],
	closestTime: '',
	shouldShowFastReply: false,
}

export const ScheduleContext = createContext<ContextProps>(DEFAULT_PROPS)

interface ContextProps {
	left: ITime
	closestTimeArray: string[]
	closestTime: string
	shouldShowFastReply: boolean
}

export const VISIT_TIME = new Date().toISOString()
interface IProviderProps {
	children: React.ReactElement
}

export const ScheduleProvider = ({ children }: IProviderProps) => {
	const busStop = useSelector(busStopSelector)
	const direction = useSelector(directionSelector)

	const [left, setLeft] = useState<ITime>(DEFAULT_LEFT)
	const [closestTimeArray, setClossestTimeArray] = useState<string[]>([])
	const [closestTime, setClossestTime] = useState<string>('')
	const [shouldShowFastReply, setShouldShowFastReply] = useState<boolean>(false)

	const currentDayKey = useSelector(currentDaySelector)

	const _everyMinuteUpdate = useEveryMinuteUpdater()
	const { SCHEDULE } = useSchedule()

	// fastreply logic
	useEffect(() => {
		if (left.hours === null) return
		const userTimeLeft = calculateHowMuchIsLeft(VISIT_TIME)
		if (userTimeLeft.minutes === null || (userTimeLeft.hours === 0 && userTimeLeft.minutes <= 0)) return

		if (left?.minutes && (left?.minutes <= 25 || left?.minutes > 40)) {
			if (shouldShowFastReply) return
			AndrewLytics('frappears')
			return setShouldShowFastReply(true)
		}

		return setShouldShowFastReply(false)
	}, [left, shouldShowFastReply])

	// finding closest time
	useEffect(() => {
		if (!busStop) return

		const _closestTime = findClosesTime(SCHEDULE[direction][currentDayKey][busStop])

		if (!_closestTime) return

		if (!closestTime || new Date(closestTime).getTime() !== new Date(_closestTime).getTime()) {
			setClossestTimeArray(findClosesTimeArray(SCHEDULE[direction][currentDayKey][busStop]))
			setClossestTime(_closestTime)
		}
	}, [_everyMinuteUpdate, closestTime, busStop, direction, SCHEDULE, currentDayKey])

	// calculation how much left
	useEffect(() => {
		const left = calculateHowMuchIsLeft(closestTime)

		setLeft(left)
	}, [_everyMinuteUpdate, closestTime])

	const values = useMemo(
		() => ({
			left,
			closestTimeArray,
			closestTime,
			shouldShowFastReply,
		}),
		[left, closestTimeArray, closestTime, shouldShowFastReply],
	)

	return <ScheduleContext.Provider value={values}>{children}</ScheduleContext.Provider>
}

export const useScheduleContext = () => {
	return useContext(ScheduleContext)
}

export default ScheduleProvider
