import React, { useContext, createContext, useState, useEffect, useMemo } from 'react'

import { AndrewLytics } from 'shared/lib'
import { calculateHowMuchIsLeft, findClosesTime, findClosesTimeArray } from 'widget/Schedule/helpers/schedule'

import useSchedule from 'widget/Schedule/model/useSchedule'
import useEveryMinuteUpdater from 'widget/Schedule/helpers/useEveryMinuteUpdater'

import { FetchInfoResponse } from 'shared/api'

import { ITime } from 'widget/Schedule/types/ITime'
import { IHoliday } from 'widget/Schedule/types/IHolidays'
import { useSelector } from 'react-redux'
import { busStopSelector, directionSelector, setBusStop } from '../../../shared/store/busStopInfoSlice'
import { getCurrentHoliday } from '../helpers/getCurrentHoliday'

const DEFAULT_LEFT = {
	hours: 0,
	minutes: 0,
}

const DEFAULT_FETCH_INFO = {
	fields: {
		message: null,
		id: null,
		link: null,
	},
}

const DEFAULT_PROPS = {
	left: DEFAULT_LEFT,
	closestTimeArray: [],
	closestTime: '',
	shouldShowFastReply: false,
	nextDay: 1,
	fetchInfo: async () => {
		return DEFAULT_FETCH_INFO
	},
	todaysHoliday: null,
	currentDay: 1,
	currentDayKey: 1,
}

export const ScheduleContext = createContext<ContextProps>(DEFAULT_PROPS)

interface ContextProps {
	left: ITime
	closestTimeArray: string[]
	closestTime: string
	shouldShowFastReply: boolean
	fetchInfo: () => FetchInfoResponse
	todaysHoliday: IHoliday | null
	currentDay: number
	currentDayKey: number
}

export const VISIT_TIME = new Date().toISOString()
interface IProviderProps {
	children: React.ReactElement
	currentDay: number
	nextDay: number
	fetchSchedule: any
	fetchInfo: any
}

export const ScheduleProvider = ({ children, fetchSchedule, currentDay, nextDay, fetchInfo }: IProviderProps) => {
	const busStop = useSelector(busStopSelector)
	const direction = useSelector(directionSelector)

	const [left, setLeft] = useState<ITime>(DEFAULT_LEFT)
	const [closestTimeArray, setClossestTimeArray] = useState<string[]>([])
	const [closestTime, setClossestTime] = useState<string>('')
	const [shouldShowFastReply, setShouldShowFastReply] = useState<boolean>(false)

	const [currentDayKey, setCurrentDayKey] = useState(currentDay)

	const _everyMinuteUpdate = useEveryMinuteUpdater()
	const { SCHEDULE, holidays } = useSchedule(fetchSchedule)
	const [todaysHoliday, setTodaysHoliday] = useState<IHoliday | null>(null)

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

	// setting holliday if exists
	useEffect(() => {
		if (holidays.length === 0) return

		const _todaysHolidays = getCurrentHoliday(holidays)

		if (_todaysHolidays.length !== 0) {
			setCurrentDayKey(_todaysHolidays[0]?.key ? _todaysHolidays[0].key : 0)

			setTodaysHoliday(_todaysHolidays[0])
		}
	}, [holidays, currentDay])

	const values = useMemo(
		() => ({
			left,
			closestTimeArray,
			closestTime,
			shouldShowFastReply,
			fetchInfo,
			todaysHoliday,
			currentDay,
			currentDayKey,
		}),
		[left, closestTimeArray, closestTime, shouldShowFastReply, fetchInfo, todaysHoliday, currentDay, currentDayKey],
	)

	return <ScheduleContext.Provider value={values}>{children}</ScheduleContext.Provider>
}

export const useScheduleContext = () => {
	return useContext(ScheduleContext)
}

export default ScheduleProvider
