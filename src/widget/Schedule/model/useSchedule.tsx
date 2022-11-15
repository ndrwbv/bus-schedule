import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FetchScheduleResponse } from 'shared/api/schedule'
import { AndrewLytics } from 'shared/lib'
import { IHolidays } from 'widget/Schedule/types/IHolidays'
import { scheduleSelector, setSchedule } from '../../../shared/store/scheduleSlice'

const useSchedule = (fetchSchedule: () => FetchScheduleResponse) => {
	const [holidays, setHolidays] = React.useState<IHolidays>([])
	const dispatch = useDispatch()
	const schedule = useSelector(scheduleSelector)

	React.useEffect(() => {
		fetchSchedule()
			.then(res => {
				if (res?.fields?.holidays?.data) {
					setHolidays(res.fields.holidays.data)
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
