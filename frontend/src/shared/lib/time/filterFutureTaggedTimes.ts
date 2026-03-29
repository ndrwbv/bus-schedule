import { TaggedTime } from 'shared/store/busStop/Stops'

import { TIME_ZONE } from '../../configs/TIME_ZONE'

export const filterFutureTaggedTimes = (taggedTimes: TaggedTime[]): TaggedTime[] => {
	const convertedDate = new Date().toLocaleString(`en-US`, { timeZone: TIME_ZONE })
	const now = new Date(convertedDate).getTime()

	return taggedTimes.filter(({ time }) => {
		const splitted = time.split(`:`).map(item => parseInt(item, 10))
		const possibleDate = new Date(convertedDate).setHours(splitted[0], splitted[1])

		return possibleDate - now > 0
	})
}
