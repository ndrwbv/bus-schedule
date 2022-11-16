import { createListenerMiddleware } from '@reduxjs/toolkit'
import { store } from 'shared/store/app/configureStore'
import { setHolidays, setTodayHoliday } from './holidaysSlice'
import { getCurrentHoliday } from './getCurrentHoliday'
import { setCurrentDayKey } from '../schedule/scheduleSlice'

// Create the middleware instance and methods
export const holidaysSetter = createListenerMiddleware()

const DEFAULT_HOLIDAY_KEY = 0 // sunday

holidaysSetter.startListening({
	actionCreator: setHolidays,
	effect: async (action, listenerApi) => {
		if (action.payload.length === 0) return

		const _todaysHolidays = getCurrentHoliday(action.payload)

		if (_todaysHolidays.length !== 0) {
			store.dispatch(setCurrentDayKey(_todaysHolidays[0]?.key ? _todaysHolidays[0].key : DEFAULT_HOLIDAY_KEY))
			store.dispatch(setTodayHoliday(_todaysHolidays[0]))
		}
	},
})
