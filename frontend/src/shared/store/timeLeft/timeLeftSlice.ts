import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from 'shared/store/app/configureStore'
import { TaggedTime } from 'shared/store/busStop/Stops'

import { ITime } from './ITime'

export const DEFAULT_LEFT = {
	hours: 0,
	minutes: 0,
}

export interface TimeLeftState {
	left: ITime
	closestTimeArray: TaggedTime[]
	closestTime: string // date string
	closestTimeVia: 'park' | 'lb' | null
	closestTimeInterpolated: boolean
	closestTimeInterpolatedFrom: string | null
}
const initialState: TimeLeftState = {
	left: DEFAULT_LEFT,
	closestTimeArray: [],
	closestTime: ``,
	closestTimeVia: null,
	closestTimeInterpolated: false,
	closestTimeInterpolatedFrom: null,
}

export const timeLeftSlice = createSlice({
	name: `timeLeftSlice`,
	initialState,
	reducers: {
		setLeft: (state, action: PayloadAction<ITime>) => {
			state.left = action.payload
		},
		setClosestTime: (
			state,
			action: PayloadAction<{
				time: string
				via: 'park' | 'lb' | null
				interpolated?: boolean
				interpolatedFrom?: string
			}>,
		) => {
			state.closestTime = action.payload.time
			state.closestTimeVia = action.payload.via
			state.closestTimeInterpolated = action.payload.interpolated ?? false
			state.closestTimeInterpolatedFrom = action.payload.interpolatedFrom ?? null
		},
		setClosestTimeArray: (state, action: PayloadAction<TaggedTime[]>) => {
			state.closestTimeArray = action.payload
		},
	},
})

// Action creators are generated for each case reducer function
export const { setLeft, setClosestTime, setClosestTimeArray } = timeLeftSlice.actions

export const leftSelector = (state: RootState): ITime => state.timeLeftSlice.left
export const closestTimeArraySelector = (state: RootState): TaggedTime[] => state.timeLeftSlice.closestTimeArray
export const closestTimeSelector = (state: RootState): string => state.timeLeftSlice.closestTime
export const closestTimeViaSelector = (state: RootState): 'park' | 'lb' | null => state.timeLeftSlice.closestTimeVia
export const closestTimeInterpolatedSelector = (state: RootState): boolean =>
	state.timeLeftSlice.closestTimeInterpolated
export const closestTimeInterpolatedFromSelector = (state: RootState): string | null =>
	state.timeLeftSlice.closestTimeInterpolatedFrom

export default timeLeftSlice.reducer
