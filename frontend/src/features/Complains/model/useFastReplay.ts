import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { AndrewLytics } from 'shared/lib'
import { calculateHowMuchIsLeft } from 'shared/lib/time/calculateHowMuchIsLeft'
import { leftSelector } from 'shared/store/timeLeft/timeLeftSlice'

const isToday = (date: Date): boolean => {
	const today = new Date()

	return (
		today.getFullYear() === date.getFullYear() &&
		today.getMonth() === date.getMonth() &&
		today.getDate() === date.getDate()
	)
}

const getTodayFirstVisit = (): string => {
	const item = localStorage.getItem(`TODAY_FIRST_VISIT`)

	if (!item || !isToday(new Date(item))) {
		const today = new Date().toISOString()
		localStorage.setItem(`TODAY_FIRST_VISIT`, today)

		return today
	}

	return item
}

export const VISIT_TIME = getTodayFirstVisit()

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

		AndrewLytics(`frappears`)

		setShouldShowFastReply(true)
	}, [left, shouldShowFastReply])

	return {
		shouldShowFastReply,
	}
}
