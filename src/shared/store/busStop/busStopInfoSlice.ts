import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from 'App/model/configureStore'
import { StopsInOptions } from '../../../widget/Schedule/const/stopsInOptions'
import { StopsOutOptions } from '../../../widget/Schedule/const/stopsOutOptions'
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
	name: 'busStopInfoSlice',
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

export const busStopSelector = (state: RootState) => state.busStopInfo.busStop
export const directionSelector = (state: RootState) => state.busStopInfo.direction
export const stopsOptionsSelector = (state: RootState) => state.busStopInfo.stopsOptions

export default busStopInfoSlice.reducer
