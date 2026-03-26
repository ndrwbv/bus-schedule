import { TIME_ZONE } from '../../configs/TIME_ZONE'

/**
 * finds closest time in schedule
 * @param hours
 */

export const findClosesTime = (hours: string[]): string | undefined => {
	const convertedDate = new Date().toLocaleString(`en-US`, { timeZone: TIME_ZONE })

	let closestTime: Date | null = null

	for (let i = 0; i < hours.length; i++) {
		const splitted = hours[i].split(`:`).map(item => parseInt(item, 10))

		const possibleDate = new Date(convertedDate).setHours(splitted[0], splitted[1])

		if (possibleDate - new Date(convertedDate).getTime() > 0) {
			if (!closestTime) closestTime = new Date(possibleDate)
			// eslint-disable-next-line sonarjs/no-duplicated-branches
			else if (closestTime.getTime() - possibleDate > 0) closestTime = new Date(possibleDate)
		}
	}

	return closestTime?.toString()
}
