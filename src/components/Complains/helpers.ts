import { calculateHowMuchIsLeft } from 'helpers/schedule'
import { Directions } from 'interfaces/Stops'
import { ComplainType } from './useComplains'

export const getMinutesString = (amount: number, secondWord = 'назад') => {
	if (amount === 0) return ' сейчас'
	if (amount === 1) return ` минуту ${secondWord}`
	if ([2, 3, 4].includes(amount)) return ` минуты ${secondWord}`

	return ` минут ${secondWord}`
}

export const getDirectionString = (direction: Directions) => {
	return direction === 'in' ? 'в парк' : 'из парка'
}

export const getTypeString = (type: ComplainType) => {
	switch (type) {
		case 'earlier':
			return 'раньше'
		case 'later':
			return 'позже'
		default:
			return ''
	}
}

export const getOnString = (on: number, type: ComplainType) => {
	return `${getTypeString(type)} на ${on}${getMinutesString(on, '')}`
}

export const getHumanDate = (date: string) => {
	const time = calculateHowMuchIsLeft(date)
	if (!time || time.hours === null || time.hours >= 1) return 'больше часа назад'

	if (time.minutes === null) return

	return `${time.minutes === 0 ? '' : time.minutes}${getMinutesString(time.minutes)}`
}
