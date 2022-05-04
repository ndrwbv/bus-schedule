import React from 'react'
import { FetchScheduleResponse } from 'api/schedule'
import defaultSchedule from 'consts/schedule'
import { AndrewLytics } from 'helpers/analytics'
import { IHolidays } from 'interfaces/IHolidays'

const useSchedule = (fetchSchedule: () => FetchScheduleResponse) => {
	const [SCHEDULE, setSchedule] = React.useState(defaultSchedule)
	const [holidays, setHolidays] = React.useState<IHolidays>([])

	React.useEffect(() => {
		fetchSchedule()
			.then(res => {
				if (res?.fields?.holidays?.data) {
					setHolidays(res.fields.holidays.data)
				}

				if (res?.fields?.schedule) {
					return setSchedule(res?.fields?.schedule)
				}

				AndrewLytics('cannotLoad')
			})
			.catch(() => {
				AndrewLytics('cannotLoad')
			})
	}, [fetchSchedule])

	return {
		SCHEDULE,
		holidays,
	}
}

export default useSchedule
