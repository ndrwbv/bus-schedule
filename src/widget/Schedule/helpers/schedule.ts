import { ITime } from 'shared/store/timeLeft/ITime'
const TIME_ZONE = 'Asia/Tomsk'

export const getDateFromTimeCode = (timeCode: string) => {
	const convertedDate = new Date().toLocaleString('en-US', { timeZone: TIME_ZONE })
	const splitted = timeCode.split(':').map(item => parseInt(item, 10))

	return new Date(convertedDate).setHours(splitted[0], splitted[1])
}
/**
 * finds closest time in schedule
 * @param hours
 */
export const findClosesTime = (hours: string[]): string | undefined => {
	const convertedDate = new Date().toLocaleString('en-US', { timeZone: TIME_ZONE })

	let closestTime: Date | null = null

	for (let i = 0; i < hours.length; i++) {
		const splitted = hours[i].split(':').map(item => parseInt(item, 10))

		const possibleDate = new Date(convertedDate).setHours(splitted[0], splitted[1])

		if (possibleDate - new Date(convertedDate).getTime() > 0) {
			if (!closestTime) closestTime = new Date(possibleDate)
			else if (closestTime.getTime() - possibleDate > 0) closestTime = new Date(possibleDate)
		}
	}

	return closestTime?.toString()
}

export const findClosesTimeArray = (hours: string[]): string[] => {
	const convertedDate = new Date().toLocaleString('en-US', { timeZone: TIME_ZONE })
	let closestTime: string[] = []

	for (let i = 0; i < hours.length; i++) {
		const splitted = hours[i].split(':').map(item => parseInt(item, 10))

		const possibleDate = new Date(convertedDate).setHours(splitted[0], splitted[1])

		if (possibleDate - new Date(convertedDate).getTime() > 0) {
			closestTime.push(hours[i])
		}
	}

	return closestTime
}

const getTimeFromMins = (mins: number): ITime => {
	let hours = Math.trunc(mins / 60)
	let minutes = Math.round(mins % 60)

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
	const convertedDate = new Date().toLocaleString('en-US', { timeZone: TIME_ZONE })

	if (!closestTime)
		return {
			hours: null,
			minutes: null,
		}

	const left = Math.abs(new Date(closestTime).getTime() - new Date(convertedDate).getTime()) / 1000 / 60

	return getTimeFromMins(left)
}

export const getNextDay = (currentDay: number) => {
	if (currentDay === 6) return 0
	return currentDay + 1
}
