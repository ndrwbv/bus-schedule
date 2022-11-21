import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from 'shared/store/app/configureStore'

import { StopsInOptions } from './const/stopsInOptions'
import { StopsOutOptions } from './const/stopsOutOptions'
import { DirectionsNew, IOption, StopKeys, StopKeysIn, StopKeysOut } from './Stops'

export interface BusStopInfoState {
	busStop: StopKeys | null
	direction: DirectionsNew
	stopsOptions: IOption<StopKeysIn | StopKeysOut | null>[]
}
const initialState: BusStopInfoState = {
	busStop: null,
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
		setBusStop: (state, action: PayloadAction<StopKeys>) => {
			state.busStop = action.payload
		},
	},
})

// Action creators are generated for each case reducer function
export const { setDirection, setBusStop } = busStopInfoSlice.actions

export const busStopSelector = (state: RootState): StopKeys | null => state.busStopInfo.busStop
export const directionSelector = (state: RootState): DirectionsNew => state.busStopInfo.direction
export const stopsOptionsSelector = (state: RootState): IOption<StopKeysIn | StopKeysOut | null>[] =>
	state.busStopInfo.stopsOptions

export default busStopInfoSlice.reducer
