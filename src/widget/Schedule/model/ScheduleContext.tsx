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
import { Directions, DirectionsNew, IOption, StopKeys, StopKeysIn, StopKeysOut } from 'widget/Schedule/types/Stops'
import { IHoliday } from 'widget/Schedule/types/IHolidays'
import { useDispatch, useSelector } from 'react-redux'
import { busStopSelector, directionSelector, setBusStop, setDirection, stopsOptionsSelector } from './busStopInfoSlice'
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
	getDirectionKeys: () => [],
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
	getDirectionKeys: (d: Directions) => string[]
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
	const busStop = useSelector(busStopSelector)
	const direction = useSelector(directionSelector)
	const stopsOptions = useSelector(stopsOptionsSelector)
	const dispatch = useDispatch()

	const [left, setLeft] = useState<ITime>(DEFAULT_LEFT)
	const [closestTimeArray, setClossestTimeArray] = useState<string[]>([])
	const [closestTime, setClossestTime] = useState<string>('')
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

	// url handling parsing from url
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
				dispatch(setBusStop(scheduleKeys[0] as StopKeys))
			} else {
				dispatch(setBusStop(_busStop))
			}
		}

		if (_direction) {
			dispatch(setDirection(_direction as DirectionsNew))
		}
	}, [searchParams, getDirectionKeys])

	// url handling direction
	useEffect(() => {
		setSearchParams(new URLSearchParams({ ...queryString.parse(searchParams.toString()), d: direction }))
	}, [direction, setSearchParams, searchParams])

	// url handling bus stop
	useEffect(() => {
		if (busStop === null) return
		setSearchParams(new URLSearchParams({ ...queryString.parse(searchParams.toString()), b: busStop }))
	}, [busStop, setSearchParams, searchParams])

	const handleChangeBusStop = (busStop: StopKeys, analyticKey: string = 'selectBusStop') => {
		analyticKey && AndrewLytics(analyticKey)
		dispatch(setBusStop(busStop))
	}

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
				getDirectionKeys,
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
