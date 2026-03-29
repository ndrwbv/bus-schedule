// eslint-disable no-nested-ternary
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from 'shared/store/app/configureStore'

import { AllStopsOptions, findStopForUserDirection, getUserDirectionsForLabel, STOPS, userDirectionFromInternal } from './const/stops'
import { DirectionsNew, IOption, IStops, StopKeys, UserDirection } from './Stops'

/*
 * busStopNew заменить когда будет редактор расписания. В SCHEDULE используются label как ключ, должен быть id
 */
export interface BusStopInfoState {
	busStop: StopKeys | null
	busStopNew: IStops<DirectionsNew> | null
	userDirection: UserDirection
	direction: DirectionsNew // internal, derived
	stopsOptions: IOption<StopKeys | null>[]
	availableUserDirections: UserDirection[]
}
const initialState: BusStopInfoState = {
	busStop: null,
	busStopNew: null,
	userDirection: UserDirection.fromCity,
	direction: DirectionsNew.inSP,
	stopsOptions: AllStopsOptions,
	availableUserDirections: [],
}

export const busStopInfoSlice = createSlice({
	name: `busStopInfoSlice`,
	initialState,
	reducers: {
		setUserDirection: (state, action: PayloadAction<UserDirection>) => {
			state.userDirection = action.payload

			if (state.busStop) {
				const stop = findStopForUserDirection(state.busStop, action.payload)
				if (stop) {
					state.busStopNew = stop
					state.direction = stop.direction
				} else {
					// Stop doesn't exist in this user direction — clear
					state.busStop = null
					state.busStopNew = null
					state.availableUserDirections = []
				}
			}
		},
		setBusStop: (state, action: PayloadAction<StopKeys | null>) => {
			state.busStop = action.payload

			if (action.payload) {
				const userDirs = getUserDirectionsForLabel(action.payload)
				state.availableUserDirections = userDirs

				// Pick user direction: keep current if valid, else first available
				const targetUserDir = userDirs.includes(state.userDirection)
					? state.userDirection
					: userDirs[0]
				state.userDirection = targetUserDir

				const stop = findStopForUserDirection(action.payload, targetUserDir)
				if (stop) {
					state.busStopNew = stop
					state.direction = stop.direction
				}
			} else {
				state.availableUserDirections = []
				state.busStopNew = null
			}
		},
		setBusStopNew: (state, action: PayloadAction<string | null>) => {
			const stop = STOPS.find(s => s.id === action.payload) || null

			state.busStopNew = stop

			if (stop) {
				state.direction = stop.direction
				state.busStop = stop.label
				state.userDirection = userDirectionFromInternal(stop.direction)
				state.availableUserDirections = getUserDirectionsForLabel(stop.label as StopKeys)
			} else {
				state.availableUserDirections = []
			}
		},
		// Keep for backward compat (middleware, etc.)
		setDirection: (state, action: PayloadAction<DirectionsNew>) => {
			state.direction = action.payload
			state.userDirection = userDirectionFromInternal(action.payload)
			if (state.busStop) {
				const stop = STOPS.find(s => s.label === state.busStop && s.direction === action.payload)
				if (stop) {
					state.busStopNew = stop
				}
			}
		},
	},
})

export const { setUserDirection, setBusStop, setBusStopNew, setDirection } = busStopInfoSlice.actions

export const busStopSelector = (state: RootState): StopKeys | null => state.busStopInfo.busStop
export const busStopNewSelector = (state: RootState): IStops<DirectionsNew> | null => state.busStopInfo.busStopNew
export const directionSelector = (state: RootState): DirectionsNew => state.busStopInfo.direction
export const userDirectionSelector = (state: RootState): UserDirection => state.busStopInfo.userDirection
export const stopsOptionsSelector = (state: RootState): IOption<StopKeys | null>[] => state.busStopInfo.stopsOptions
export const availableUserDirectionsSelector = (state: RootState): UserDirection[] =>
	state.busStopInfo.availableUserDirections

export default busStopInfoSlice.reducer
