import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from 'shared/store/app/configureStore'
import { ITime } from './ITime'

export const DEFAULT_LEFT = {
	hours: 0,
	minutes: 0,
}

export interface TimeLeftState {
	left: ITime
	closestTimeArray: string[]
	closestTime: string // date string
}
const initialState: TimeLeftState = {
	left: DEFAULT_LEFT,
	closestTimeArray: [],
	closestTime: '',
}

export const timeLeftSlice = createSlice({
	name: 'timeLeftSlice',
	initialState,
	reducers: {
		setLeft: (state, action: PayloadAction<ITime>) => {
			state.left = action.payload
		},
		setClosestTime: (state, action: PayloadAction<string>) => {
			state.closestTime = action.payload
		},
		setClosestTimeArray: (state, action: PayloadAction<string[]>) => {
			state.closestTimeArray = action.payload
		},
	},
})

// Action creators are generated for each case reducer function
export const { setLeft, setClosestTime, setClosestTimeArray } = timeLeftSlice.actions

export const leftSelector = (state: RootState) => state.timeLeftSlice.left
export const closestTimeArraySelector = (state: RootState) => state.timeLeftSlice.closestTimeArray
export const closestTimeSelector = (state: RootState) => state.timeLeftSlice.closestTime

export default timeLeftSlice.reducer
