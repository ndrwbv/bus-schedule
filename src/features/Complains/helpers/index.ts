import { calculateHowMuchIsLeft } from 'shared/lib/time/calculateHowMuchIsLeft'
import { Directions } from 'shared/store/busStop/Stops'

import { ComplainType } from '../model/Complains'

export const getMinutesString = (amount: number, secondWord = `назад`): string => {
	if (amount === 0) return ` сейчас`
	if (amount === 1) return ` минуту ${secondWord}`
	if ([2, 3, 4].includes(amount)) return ` минуты ${secondWord}`

	return ` минут ${secondWord}`
}

export const getDirectionString = (direction: Directions): string => {
	return direction === `inSP` ? `в парк` : `из парка`
}

export const getTypeString = (type: ComplainType): string => {
	switch (type) {
		case ComplainType.earlier:
			return `приехал раньше`
		case ComplainType.later:
			return `приехал позже`
		case ComplainType.not_arrive:
			return `не приехал`
		case ComplainType.passed_by:
			return `проехал мимо`
		default:
			return ``
	}
}

export const getOnString = (on: number, type: ComplainType): string => {
	if (on === 0) return getTypeString(type)

	const commingType = getTypeString(type)
	const minutesString = getMinutesString(on, ``)

	return `${commingType} на ${on}${minutesString}`
}

export const getHumanDate = (date: string): string => {
	const time = calculateHowMuchIsLeft(date)
	const d = new Date(date)
	const min = d.getMinutes() < 9 ? `0${d.getMinutes()}` : d.getMinutes()
	if (time.hours === null || time.hours >= 1) return `в ${d.getHours()}:${min}`

	if (time.minutes === null) return ``

	const timeAmountString = time.minutes === 0 ? `` : time.minutes
	const minutesString = getMinutesString(time.minutes)

	return `${timeAmountString}${minutesString}`
}
