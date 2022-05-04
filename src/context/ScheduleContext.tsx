import React, { useContext, createContext, useCallback, useState, useEffect } from 'react'

import { StopsInOptions } from 'consts/stopsInOptions'
import { StopsOutOptions } from 'consts/stopsOutOptions'

import { AndrewLytics } from 'helpers/analytics'
import { calculateHowMuchIsLeft, findClosesTime, findClosesTimeArray } from 'helpers/schedule'

import useSchedule from 'hooks/useSchedule'
import useEveryMinuteUpdater from 'hooks/useEveryMinuteUpdater'

import { FetchInfoResponse, FetchScheduleResponse } from 'api'

import { ISchedule } from 'interfaces/ISchedule'
import { ITime } from 'interfaces/ITime'
import { Directions, IStop, StopKeys, StopKeysIn, StopKeysOut } from 'interfaces/Stops'
import { IHoliday, IHolidays } from 'interfaces/IHolidays'

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
}

export const ScheduleContext = createContext<ContextProps>(DEFAULT_PROPS)

interface ContextProps {
	busStop: StopKeys | null
	left: ITime
	closestTimeArray: string[]
	closestTime: string
	shouldShowFastReply: boolean
	stopsOptions: IStop<StopKeysIn | StopKeysOut | null>[]
	direction: Directions
	SCHEDULE: ISchedule
	handleChangeBusStop: (busStop: StopKeys, analyticKey?: string) => void
	handleChangeDirection: (key: "in" | "out") => void
	nextDay: number
	fetchInfo: () => FetchInfoResponse
	todaysHoliday: IHoliday | null
}

interface IProviderProps {
	children: React.ReactElement
	currentDay: number
	nextDay: number
	fetchSchedule: () => FetchScheduleResponse
	fetchInfo: () => FetchInfoResponse
}
export const ScheduleProvider = ({ children, fetchSchedule, currentDay, nextDay, fetchInfo }: IProviderProps) => {
	const [busStop, setBusStop] = useState<StopKeys | null>(null)
	const [left, setLeft] = useState<ITime>(DEFAULT_LEFT)
	const [closestTimeArray, setClossestTimeArray] = useState<string[]>([])
	const [closestTime, setClossestTime] = useState<string>('')

	const [direction, setDirection] = useState<Directions>('out')
	const [stopsOptions, setStopsOptions] = useState<IStop<StopKeysIn | StopKeysOut | null>[]>(StopsOutOptions)
	const [shouldShowFastReply, setShouldShowFastReply] = useState<boolean>(false)

	const [currentDayKey, setCurrentDayKey] = useState(currentDay)

	const _everyMinuteUpdate = useEveryMinuteUpdater()
	const { SCHEDULE, holidays } = useSchedule(fetchSchedule)
	const [todaysHoliday, setTodaysHoliday] = useState<IHoliday | null>(null)

	const handleChangeDirection = useCallback(
		(_direction: Directions) => {
			const scheduleKeys = Object.keys(SCHEDULE[_direction][currentDayKey])
			if (busStop && !scheduleKeys.includes(busStop)) {
				setBusStop(scheduleKeys[0] as StopKeys)
			}

			setStopsOptions(_direction === 'in' ? StopsInOptions : StopsOutOptions)
			setDirection(_direction)
		},
		[SCHEDULE, currentDayKey, busStop],
	)

	const handleChangeBusStop = (busStop: StopKeys, analyticKey: string = 'selectBusStop') => {
		analyticKey && AndrewLytics(analyticKey)
		setBusStop(busStop)
	}

	useEffect(() => {
		if (left.hours === null) return

		if (left?.minutes && (left?.minutes <= 15 || left?.minutes > 40)) {
			return setShouldShowFastReply(true)
		}

		return setShouldShowFastReply(false)
	}, [left])

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
			setCurrentDayKey(_todaysHolidays[0]?.key ? _todaysHolidays[0].key : 0 ) 

			setTodaysHoliday(_todaysHolidays[0])
		}
	}, [holidays, currentDay])

	const getCurrentHoliday = (holidays: IHolidays): IHoliday[] => {
		const today = new Date()
		today.setHours(0, 0, 0, 0)

		return holidays.filter(holiday => {
			const start = new Date(`${holiday.start}.${today.getFullYear()}`)
			const end = new Date(`${holiday.end}.${today.getFullYear()}`)

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
