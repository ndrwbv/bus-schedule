import { createSlice } from '@reduxjs/toolkit'

export interface FeatureToggleState {
	isHalloweenMode: boolean
}

const initialState: FeatureToggleState = {
	isHalloweenMode: false,
}

export const featureToggleSlice = createSlice({
	name: `featureToggle`,
	initialState,
	reducers: {},
})

export default featureToggleSlice.reducer
