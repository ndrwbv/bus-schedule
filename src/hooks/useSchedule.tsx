import React from 'react'
import { FetchScheduleResponse } from 'api/schedule'
import defaultSchedule from 'consts/schedule'
import { AndrewLytics } from 'helpers'

const useSchedule = (fetchSchedule: () => FetchScheduleResponse) => {
	const [SCHEDULE, setSchedule] = React.useState(defaultSchedule)

	React.useEffect(() => {
		fetchSchedule()
			.then(res => {
				if (res?.fields?.schedule) {
					setSchedule(res?.fields?.schedule)
				} else {
					AndrewLytics('cannotLoad')
				}
			})
			.catch(() => {
				AndrewLytics('cannotLoad')
			})
	}, [])

	return {
		SCHEDULE,
	}
}

export default useSchedule
