import React from 'react'
import { FetchScheduleResponse } from 'api/schedule'
import defaultSchedule from 'consts/schedule'
import { AndrewLytics } from 'helpers/analytics'
import { IHolidays } from 'interfaces/IHolidays'

const useSchedule = (fetchSchedule: () => FetchScheduleResponse) => {
	const [SCHEDULE, setSchedule] = React.useState(defaultSchedule)
	const [holidays, setHolidays] = React.useState<IHolidays>([
		{
            "name": "1 мая",
            "start": "05.01",
            "end": "05.03"
        },
        {
            "name": "9 мая",
            "start": "05.09",
            "end": "05.09"
        }
    ])

	React.useEffect(() => {
		fetchSchedule()
			.then(res => {
				// console.log(res)
				// if (res?.fields?.holidays) {
				// 	setHolidays(res.fields.holidays)
				// }

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
