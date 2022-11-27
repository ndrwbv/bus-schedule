import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from 'shared/store/app/configureStore'

import { STOPS } from './const/stops'
import { StopsInOptions } from './const/stopsInOptions'
import { StopsOutOptions } from './const/stopsOutOptions'
import { DirectionsNew, IOption, IStops, StopKeys } from './Stops'

/*
 * busStopNew заменить когда будет редактор расписания. В SCHEDULE используются label как ключ, должен быть id
 */
export interface BusStopInfoState {
	busStop: StopKeys | null
	busStopNew: IStops<DirectionsNew> | null
	direction: DirectionsNew
	stopsOptions: IOption<StopKeys | null>[]
}
const initialState: BusStopInfoState = {
	busStop: null,
	busStopNew: null,
	direction: DirectionsNew.out,
	stopsOptions: StopsOutOptions,
}

export const busStopInfoSlice = createSlice({
	name: `busStopInfoSlice`,
	initialState,
	reducers: {
		setDirection: (state, action: PayloadAction<DirectionsNew>) => {
			state.direction = action.payload
			state.stopsOptions = action.payload === DirectionsNew.in ? StopsInOptions : StopsOutOptions
		},
		setBusStop: (state, action: PayloadAction<StopKeys | null>) => {
			const stop = STOPS.find(s => s.label === action.payload && s.direction === state.direction) || null

			state.busStop = action.payload
			state.busStopNew = stop
		},
		setBusStopNew: (state, action: PayloadAction<string | null>) => {
			const stop = STOPS.find(s => s.id === action.payload && s.direction === state.direction) || null

			state.busStopNew = stop
		},
	},
})

// Action creators are generated for each case reducer function
export const { setDirection, setBusStop } = busStopInfoSlice.actions

export const busStopSelector = (state: RootState): StopKeys | null => state.busStopInfo.busStop
export const busStopNewSelector = (state: RootState): IStops<DirectionsNew> | null => state.busStopInfo.busStopNew
export const directionSelector = (state: RootState): DirectionsNew => state.busStopInfo.direction
export const stopsOptionsSelector = (state: RootState): IOption<StopKeys | null>[] => state.busStopInfo.stopsOptions

export default busStopInfoSlice.reducer
