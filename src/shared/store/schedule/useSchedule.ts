/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { fetchSchedule } from 'shared/api/schedule'
import { AndrewLytics } from 'shared/lib'
import { setHolidays } from 'shared/store/holidays/holidaysSlice'

import { setSchedule } from './scheduleSlice'

const useSchedule = (): void => {
	const dispatch = useDispatch()

	useEffect(() => {
		fetchSchedule()
			.then(res => {
				if (res.fields.holidays.data) {
					dispatch(setHolidays(res.fields.holidays.data))
				}

				if (res.fields.schedule) {
					// dispatch(setSchedule(res.fields.schedule))

					return null
				}

				AndrewLytics(`cannotLoad`)

				return null
			})
			.catch(() => {
				AndrewLytics(`cannotLoad`)
			})
	}, [dispatch])
}

export default useSchedule
