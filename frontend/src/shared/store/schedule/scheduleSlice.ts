import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { SCHEDULE } from 'shared/common'
import { RootState } from 'shared/store/app/configureStore'

import { getNextDay } from './getNextDay'
import { ISchedule } from './ISchedule'

export interface BusStopInfoState {
	schedule: ISchedule
	currentDayKey: number
	nextDayKey: number
	scheduleSource: 'hardcoded' | 'api' | 'cache'
	lastUpdatedAt: string | null
	lastCheckedAt: string | null
	parseMethod: string | null
}

const initialState: BusStopInfoState = {
	schedule: SCHEDULE,
	currentDayKey: new Date().getDay(),
	nextDayKey: getNextDay(new Date().getDay()),
	scheduleSource: `hardcoded`,
	lastUpdatedAt: null,
	lastCheckedAt: null,
	parseMethod: null,
}

export const busStopInfoSlice = createSlice({
	name: `scheduleSlice`,
	initialState,
	reducers: {
		setSchedule: (state, action: PayloadAction<ISchedule>) => {
			state.schedule = action.payload
		},
		setScheduleFromApi: (
			state,
			action: PayloadAction<{
				schedule: ISchedule
				source: 'api' | 'cache'
				updatedAt: string
				lastCheckedAt: string
				parseMethod: string
			}>,
		) => {
			state.schedule = action.payload.schedule
			state.scheduleSource = action.payload.source
			state.lastUpdatedAt = action.payload.updatedAt
			state.lastCheckedAt = action.payload.lastCheckedAt
			state.parseMethod = action.payload.parseMethod
		},
		setCurrentDayKey: (state, action: PayloadAction<number>) => {
			state.currentDayKey = action.payload
			state.nextDayKey = getNextDay(action.payload)
		},
	},
})

export const { setSchedule, setScheduleFromApi, setCurrentDayKey } = busStopInfoSlice.actions

export const scheduleSelector = (state: RootState): ISchedule => state.scheduleSlice.schedule
export const currentDaySelector = (state: RootState): number => state.scheduleSlice.currentDayKey
export const nextDaySelector = (state: RootState): number => state.scheduleSlice.nextDayKey
export const scheduleSourceSelector = (state: RootState): 'cache' | 'api' | 'hardcoded' =>
	state.scheduleSlice.scheduleSource
export const lastUpdatedAtSelector = (state: RootState): string | null => state.scheduleSlice.lastUpdatedAt
export const lastCheckedAtSelector = (state: RootState): string | null => state.scheduleSlice.lastCheckedAt

export default busStopInfoSlice.reducer
