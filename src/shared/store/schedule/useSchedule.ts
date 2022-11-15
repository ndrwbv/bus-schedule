import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { fetchSchedule } from 'shared/api/schedule'
import { AndrewLytics } from 'shared/lib'
import { setHolidays } from 'shared/store/holidays/holidaysSlice'
import { setSchedule } from './scheduleSlice'

const useSchedule = () => {
	const dispatch = useDispatch()

	useEffect(() => {
		fetchSchedule()
			.then(res => {
				if (res?.fields?.holidays?.data) {
					dispatch(setHolidays(res.fields.holidays.data))
				}

				if (res?.fields?.schedule) {
					return dispatch(setSchedule(res?.fields?.schedule))
				}

				AndrewLytics('cannotLoad')
			})
			.catch(() => {
				AndrewLytics('cannotLoad')
			})
	}, [])
}

export default useSchedule
