import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from 'shared/store/app/configureStore'
import { TripRef } from 'shared/store/busStop/const/stops'

export interface TripStopsState {
	trip: TripRef | null
}

const initialState: TripStopsState = {
	trip: null,
}

export const tripStopsSlice = createSlice({
	name: `tripStops`,
	initialState,
	reducers: {
		openTrip: (state, action: PayloadAction<TripRef>) => {
			state.trip = action.payload
		},
		closeTrip: state => {
			state.trip = null
		},
	},
})

export const { openTrip, closeTrip } = tripStopsSlice.actions

export const openedTripSelector = (state: RootState): TripRef | null => state.tripStops.trip

export default tripStopsSlice.reducer
