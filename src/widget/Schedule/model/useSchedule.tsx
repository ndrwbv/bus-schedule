import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FetchScheduleResponse } from 'shared/api/schedule'
import { AndrewLytics } from 'shared/lib'
import { holidaysSelector, setHolidays } from 'shared/store/holidays/holidaysSlice'
import { scheduleSelector, setSchedule } from '../../../shared/store/schedule/scheduleSlice'

const useSchedule = (fetchSchedule: () => FetchScheduleResponse) => {
	const dispatch = useDispatch()
	const schedule = useSelector(scheduleSelector)
	const holidays = useSelector(holidaysSelector)

	React.useEffect(() => {
		fetchSchedule()
			.then(res => {
				if (res?.fields?.holidays?.data) {
					dispatch(setHolidays(res.fields.holidays.data))
					// dispatch(setHolidays([{end: "11-15", name: "День народного единства", start: "11-15"}]))
				}

				if (res?.fields?.schedule) {
					return dispatch(setSchedule(res?.fields?.schedule))
				}

				AndrewLytics('cannotLoad')
			})
			.catch(() => {
				AndrewLytics('cannotLoad')
			})
	}, [fetchSchedule])

	return {
		SCHEDULE: schedule,
		holidays,
	}
}

export default useSchedule
