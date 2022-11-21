import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { SCHEDULE } from 'shared/common'
import { RootState } from 'shared/store/app/configureStore'

import { getNextDay } from './getNextDay'
import { ISchedule } from './ISchedule'

export interface BusStopInfoState {
	schedule: ISchedule
	currentDayKey: number
	nextDayKey: number
}
const initialState: BusStopInfoState = {
	schedule: SCHEDULE,
	currentDayKey: new Date().getDay(),
	nextDayKey: getNextDay(new Date().getDay()),
}

export const busStopInfoSlice = createSlice({
	name: `scheduleSlice`,
	initialState,
	reducers: {
		setSchedule: (state, action: PayloadAction<ISchedule>) => {
			state.schedule = action.payload
		},
		setCurrentDayKey: (state, action: PayloadAction<number>) => {
			state.currentDayKey = action.payload
			state.nextDayKey = getNextDay(action.payload)
		},
	},
})

// Action creators are generated for each case reducer function
export const { setSchedule, setCurrentDayKey } = busStopInfoSlice.actions

export const scheduleSelector = (state: RootState): ISchedule => state.scheduleSlice.schedule
export const currentDaySelector = (state: RootState): number => state.scheduleSlice.currentDayKey
export const nextDaySelector = (state: RootState): number => state.scheduleSlice.nextDayKey

export default busStopInfoSlice.reducer
