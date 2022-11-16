import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from 'shared/store/app/configureStore'
import { IHoliday, IHolidays } from './IHolidays'

export interface HolidaysState {
	holidays: IHolidays
	todayHoliday: IHoliday | null
}
const initialState: HolidaysState = {
	holidays: [],
	todayHoliday: null,
}

export const holidaysSlice = createSlice({
	name: 'holidaysSlice',
	initialState,
	reducers: {
		setHolidays: (state, action: PayloadAction<IHolidays>) => {
			state.holidays = action.payload
		},
		setTodayHoliday: (state, action: PayloadAction<IHoliday>) => {
			state.todayHoliday = action.payload
		},
	},
})

// Action creators are generated for each case reducer function
export const { setHolidays, setTodayHoliday } = holidaysSlice.actions

export const holidaysSelector = (state: RootState) => state.holidaysSlice.holidays
export const todayHolidaySelector = (state: RootState) => state.holidaysSlice.todayHoliday

export default holidaysSlice.reducer
