import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { AndrewLytics } from 'shared/lib'
import { calculateHowMuchIsLeft } from 'shared/lib/time/calculateHowMuchIsLeft'
import { leftSelector } from 'shared/store/timeLeft/timeLeftSlice'

export const VISIT_TIME = new Date().toISOString()
interface IReturns {
	shouldShowFastReply: boolean
}

export const useFastReplay = (): IReturns => {
	const left = useSelector(leftSelector)
	const [shouldShowFastReply, setShouldShowFastReply] = useState<boolean>(false)

	useEffect(() => {
		if (left.hours === null) return

		const userTimeLeft = calculateHowMuchIsLeft(VISIT_TIME)

		if (userTimeLeft.minutes === null || (userTimeLeft.hours === 0 && userTimeLeft.minutes <= 0)) return

		if (left.minutes && (left.minutes <= 25 || left.minutes > 40)) {
			if (shouldShowFastReply) return

			AndrewLytics(`frappears`)

			setShouldShowFastReply(true)

			return
		}

		setShouldShowFastReply(false)
	}, [left, shouldShowFastReply])

	return {
		shouldShowFastReply,
	}
}
