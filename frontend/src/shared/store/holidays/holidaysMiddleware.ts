import { createListenerMiddleware } from '@reduxjs/toolkit'
import { store } from 'shared/store/app/configureStore'

import { setCurrentDayKey } from '../schedule/scheduleSlice'
import { getCurrentHoliday } from './getCurrentHoliday'
import { setHolidays, setTodayHoliday } from './holidaysSlice'

// Create the middleware instance and methods
export const holidaysSetter = createListenerMiddleware()

const DEFAULT_HOLIDAY_KEY = 0 // sunday

holidaysSetter.startListening({
	actionCreator: setHolidays,
	effect: action => {
		if (action.payload.length === 0) return

		const todaysHolidays = getCurrentHoliday(action.payload)

		if (todaysHolidays.length !== 0) {
			store.dispatch(setCurrentDayKey(todaysHolidays[0]?.key ? todaysHolidays[0].key : DEFAULT_HOLIDAY_KEY))
			store.dispatch(setTodayHoliday(todaysHolidays[0]))
		}
	},
})
