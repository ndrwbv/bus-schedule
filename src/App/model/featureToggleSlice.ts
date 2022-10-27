import { createSlice } from '@reduxjs/toolkit'

export interface FeatureToggleState {
	isHalloweenMode: boolean
}

const initialState: FeatureToggleState = {
	isHalloweenMode: true,
}

export const featureToggleSlice = createSlice({
	name: 'featureToggle',
	initialState,
	reducers: {},
})

// Action creators are generated for each case reducer function
export const {} = featureToggleSlice.actions

export default featureToggleSlice.reducer
