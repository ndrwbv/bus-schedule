import React, { useContext, createContext, useCallback, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import queryString from 'query-string'

import { StopsInOptions } from '../const/stopsInOptions'
import { StopsOutOptions } from '../const/stopsOutOptions'

import { AndrewLytics } from 'shared/lib'
import { calculateHowMuchIsLeft, findClosesTime, findClosesTimeArray } from 'widget/Schedule/helpers/schedule'

import useSchedule from 'widget/Schedule/model/useSchedule'
import useEveryMinuteUpdater from 'widget/Schedule/helpers/useEveryMinuteUpdater'

import { FetchInfoResponse } from 'shared/api'

import { ISchedule } from 'widget/Schedule/types/ISchedule'
import { ITime } from 'widget/Schedule/types/ITime'
import { Directions, IOption, StopKeys, StopKeysIn, StopKeysOut } from 'widget/Schedule/types/Stops'
import { IHoliday, IHolidays } from 'widget/Schedule/types/IHolidays'

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

const DEFAULT_SCHEDULE = {
	in: [],
	out: [],
}

const DEFAULT_PROPS = {
	busStop: null,
	left: DEFAULT_LEFT,
	closestTimeArray: [],
	closestTime: '',
	shouldShowFastReply: false,
	stopsOptions: StopsOutOptions,
	direction: 'out' as Directions,
	SCHEDULE: DEFAULT_SCHEDULE,
	nextDay: 1,
	handleChangeDirection: () => {},
	handleChangeBusStop: () => {},
	fetchInfo: async () => {
		return DEFAULT_FETCH_INFO
	},
	todaysHoliday: null,
	currentDay: 1,
	currentDayKey: 1,
}

export const ScheduleContext = createContext<ContextProps>(DEFAULT_PROPS)

interface ContextProps {
	busStop: StopKeys | null
	left: ITime
	closestTimeArray: string[]
	closestTime: string
	shouldShowFastReply: boolean
	stopsOptions: IOption<StopKeysIn | StopKeysOut | null>[]
	direction: Directions
	SCHEDULE: ISchedule
	handleChangeBusStop: (busStop: StopKeys, analyticKey?: string) => void
	handleChangeDirection: (key: 'in' | 'out') => void
	nextDay: number
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
	const [busStop, setBusStop] = useState<StopKeys | null>(null)
	const [left, setLeft] = useState<ITime>(DEFAULT_LEFT)
	const [closestTimeArray, setClossestTimeArray] = useState<string[]>([])
	const [closestTime, setClossestTime] = useState<string>('')
	const [direction, setDirection] = useState<Directions>('out')
	const [stopsOptions, setStopsOptions] = useState<IOption<StopKeysIn | StopKeysOut | null>[]>(StopsOutOptions)
	const [shouldShowFastReply, setShouldShowFastReply] = useState<boolean>(false)

	const [currentDayKey, setCurrentDayKey] = useState(currentDay)

	const _everyMinuteUpdate = useEveryMinuteUpdater()
	const { SCHEDULE, holidays } = useSchedule(fetchSchedule)
	const [todaysHoliday, setTodaysHoliday] = useState<IHoliday | null>(null)

	let [searchParams, setSearchParams] = useSearchParams()

	const getDirectionKeys = useCallback(
		(d: Directions) => (d ? Object.keys(SCHEDULE[d][currentDayKey]) : []),
		[SCHEDULE, currentDayKey],
	)

	useEffect(() => {
		const parsed = queryString.parse(searchParams.toString())

		const _busStop = parsed['b'] as StopKeys
		const _direction: Directions | undefined = ['in', 'out'].includes(parsed['d'] as Directions)
			? (parsed['d'] as Directions)
			: undefined

		if (!_direction || !_busStop) return

		if (_busStop) {
			const scheduleKeys = getDirectionKeys(_direction)
			const isBusStopNotInKeys = !scheduleKeys.includes(_busStop)

			if (isBusStopNotInKeys) {
				setBusStop(scheduleKeys[0] as StopKeys)
			} else {
				setBusStop(_busStop)
			}
		}

		if (_direction) {
			changeDirection(_direction as Directions)
		}
	}, [searchParams, getDirectionKeys])

	const changeDirection = (_direction: Directions) => {
		setStopsOptions(_direction === 'in' ? StopsInOptions : StopsOutOptions)
		setDirection(_direction)
	}

	useEffect(() => {
		setSearchParams(new URLSearchParams({ ...queryString.parse(searchParams.toString()), d: direction }))
	}, [direction, setSearchParams, searchParams])

	useEffect(() => {
		if (busStop === null) return
		setSearchParams(new URLSearchParams({ ...queryString.parse(searchParams.toString()), b: busStop }))
	}, [busStop, setSearchParams, searchParams])

	const handleChangeDirection = useCallback(
		(_direction: Directions) => {
			changeDirection(_direction)

			const scheduleKeys = getDirectionKeys(_direction)
			if (busStop && !scheduleKeys.includes(busStop)) {
				setBusStop(scheduleKeys[0] as StopKeys)
			}

			AndrewLytics('changeDirection')
		},
		[busStop, getDirectionKeys],
	)

	const handleChangeBusStop = (busStop: StopKeys, analyticKey: string = 'selectBusStop') => {
		analyticKey && AndrewLytics(analyticKey)
		setBusStop(busStop)
	}

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

	useEffect(() => {
		if (!busStop) return

		const _closestTime = findClosesTime(SCHEDULE[direction][currentDayKey][busStop])

		if (!_closestTime) return

		if (!closestTime || new Date(closestTime).getTime() !== new Date(_closestTime).getTime()) {
			setClossestTimeArray(findClosesTimeArray(SCHEDULE[direction][currentDayKey][busStop]))
			setClossestTime(_closestTime)
		}
	}, [_everyMinuteUpdate, closestTime, busStop, direction, SCHEDULE, currentDayKey])

	useEffect(() => {
		const left = calculateHowMuchIsLeft(closestTime)

		setLeft(left)
	}, [_everyMinuteUpdate, closestTime])

	useEffect(() => {
		if (holidays.length === 0) return

		const _todaysHolidays = getCurrentHoliday(holidays)

		if (_todaysHolidays.length !== 0) {
			setCurrentDayKey(_todaysHolidays[0]?.key ? _todaysHolidays[0].key : 0)

			setTodaysHoliday(_todaysHolidays[0])
		}
	}, [holidays, currentDay])

	const getCurrentHoliday = (holidays: IHolidays): IHoliday[] => {
		const today = new Date()
		today.setHours(0, 0, 0, 0)

		return holidays.filter(holiday => {
			const start = new Date(`${today.getFullYear()}-${holiday.start}`)
			const end = new Date(`${today.getFullYear()}-${holiday.end}`)
			start.setHours(0, 0, 0, 0)
			end.setHours(0, 0, 0, 0)

			if (today <= end && today >= start) {
				return true
			}

			return false
		})
	}

	return (
		<ScheduleContext.Provider
			value={{
				busStop,
				left,
				closestTimeArray,
				closestTime,
				shouldShowFastReply,
				stopsOptions,
				direction,
				handleChangeBusStop,
				SCHEDULE,
				handleChangeDirection,
				nextDay,
				fetchInfo,
				todaysHoliday,
				currentDay,
				currentDayKey,
			}}
		>
			{children}
		</ScheduleContext.Provider>
	)
}

export const useScheduleContext = () => {
	return useContext(ScheduleContext)
}

export default ScheduleProvider
