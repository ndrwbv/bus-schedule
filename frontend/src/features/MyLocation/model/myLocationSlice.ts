import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from 'shared/store/app/configureStore'

export interface MyLocationState {
	location: GeolocationPosition | undefined
	error: GeolocationPositionError | undefined
	noGeolocation: boolean
}

const initialState: MyLocationState = {
	location: undefined,
	error: undefined,
	noGeolocation: false,
}

export const myLocationSlice = createSlice({
	name: `myLocationSlice`,
	initialState,
	reducers: {
		setLocation: (state, action: PayloadAction<GeolocationPosition>) => {
			state.location = action.payload
		},
		setLocationError: (state, action: PayloadAction<GeolocationPositionError>) => {
			state.error = action.payload
		},
		setNoGeolocation: (state, action: PayloadAction<boolean>) => {
			state.noGeolocation = action.payload
		},
	},
})

// Action creators are generated for each case reducer function
export const { setLocation, setLocationError, setNoGeolocation } = myLocationSlice.actions

export const userLocationSelector = (state: RootState): GeolocationPosition | undefined =>
	state.myLocationSlice.location

export default myLocationSlice.reducer
