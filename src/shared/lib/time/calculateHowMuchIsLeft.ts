import { ITime } from 'shared/store/timeLeft/ITime'

import { TIME_ZONE } from '../../configs/TIME_ZONE'

export const getTimeFromMins = (mins: number): ITime => {
	const hours = Math.trunc(mins / 60)
	const minutes = Math.round(mins % 60)

	return {
		hours,
		minutes,
	}
}

/**
 * Finds difference between current time and schedule time
 * @param closestTime
 * @currentDate
 */

export const calculateHowMuchIsLeft = (closestTime: string | null): ITime => {
	const convertedDate = new Date().toLocaleString(`en-US`, { timeZone: TIME_ZONE })

	if (!closestTime)
		return {
			hours: null,
			minutes: null,
		}

	const left = Math.abs(new Date(closestTime).getTime() - new Date(convertedDate).getTime()) / 1000 / 60

	return getTimeFromMins(left)
}
