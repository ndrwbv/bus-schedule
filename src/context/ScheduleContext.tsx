import React, { useContext, createContext, useCallback } from 'react'

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
	changeDirectionIn: () => {},
	changeDirectionOut: () => {},
	fetchInfo: async () => {
		return DEFAULT_FETCH_INFO
	},
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
	changeDirectionIn: () => void
	changeDirectionOut: () => void
	nextDay: number
	fetchInfo: () => FetchInfoResponse
}

interface IProviderProps {
	children: React.ReactElement
	currentDay: number
	nextDay: number
	fetchSchedule: () => FetchScheduleResponse
	fetchInfo: () => FetchInfoResponse
}
export const ScheduleProvider = ({ children, fetchSchedule, currentDay, nextDay, fetchInfo }: IProviderProps) => {
	const [busStop, setBusStop] = React.useState<StopKeys | null>(null)
	const [left, setLeft] = React.useState<ITime>(DEFAULT_LEFT)
	const [closestTimeArray, setClossestTimeArray] = React.useState<string[]>([])
	const [closestTime, setClossestTime] = React.useState<string>('')

	const [direction, setDirection] = React.useState<Directions>('out')
	const [stopsOptions, setStopsOptions] = React.useState<IStop<StopKeysIn | StopKeysOut | null>[]>(StopsOutOptions)
	const [shouldShowFastReply, setShouldShowFastReply] = React.useState<boolean>(false)

	const _everyMinuteUpdate = useEveryMinuteUpdater()
	const SCHEDULE = useSchedule(fetchSchedule)

	const handleChangeDirection = useCallback(
		(_direction: Directions) => {
			const scheduleKeys = Object.keys(SCHEDULE[_direction][currentDay])
			if (busStop && !scheduleKeys.includes(busStop)) {
				setBusStop(scheduleKeys[0] as StopKeys)
			}

			setStopsOptions(_direction === 'in' ? StopsInOptions : StopsOutOptions)
			setDirection(_direction)
		},
		[SCHEDULE, currentDay, busStop],
	)

	const changeDirectionIn = () => handleChangeDirection('in')
	const changeDirectionOut = () => handleChangeDirection('out')

	const handleChangeBusStop = (busStop: StopKeys, analyticKey: string = 'selectBusStop') => {
		analyticKey && AndrewLytics(analyticKey)
		setBusStop(busStop)
	}

	React.useEffect(() => {
		if (left.hours === null) return

		if (left?.minutes && (left?.minutes <= 15 || left?.minutes > 40)) {
			return setShouldShowFastReply(true)
		}

		return setShouldShowFastReply(false)
	}, [left])

	React.useEffect(() => {
		if (!busStop) return

		const _closestTime = findClosesTime(SCHEDULE[direction][currentDay][busStop])

		if (!_closestTime) return

		if (!closestTime || new Date(closestTime).getTime() !== new Date(_closestTime).getTime()) {
			setClossestTimeArray(findClosesTimeArray(SCHEDULE[direction][currentDay][busStop]))
			setClossestTime(_closestTime)
		}
	}, [_everyMinuteUpdate, closestTime, busStop, direction, SCHEDULE, currentDay])

	React.useEffect(() => {
		const left = calculateHowMuchIsLeft(closestTime)

		setLeft(left)
	}, [_everyMinuteUpdate, closestTime])

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
				changeDirectionIn,
				changeDirectionOut,
				nextDay,
				fetchInfo,
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
