import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface FeatureToggleState {
	isHalloweenMode: boolean
	liveTracking: boolean
}

const initialState: FeatureToggleState = {
	isHalloweenMode: false,
	liveTracking: false,
}

export const featureToggleSlice = createSlice({
	name: `featureToggle`,
	initialState,
	reducers: {
		setLiveTracking: (state, action: PayloadAction<boolean>) => {
			state.liveTracking = action.payload
		},
	},
})

export const { setLiveTracking } = featureToggleSlice.actions

export default featureToggleSlice.reducer
