import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from 'App/model/configureStore'
import { SCHEDULE } from 'shared/common'
import { getNextDay } from '../helpers/schedule'
import { ISchedule } from '../types/ISchedule'

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
	name: 'scheduleSlice',
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
export const { setSchedule } = busStopInfoSlice.actions

export const scheduleSelector = (state: RootState) => state.scheduleSlice.schedule

export default busStopInfoSlice.reducer
