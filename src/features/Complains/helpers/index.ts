import { calculateHowMuchIsLeft } from 'helpers/schedule'
import { Directions } from 'interfaces/Stops'
import { ComplainType } from 'interfaces/Complains'

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
		case ComplainType.earlier:
			return 'приехал раньше'
		case ComplainType.later:
			return 'приехал позже'
		case ComplainType.not_arrive:
			return 'не приехал'
		default:
			return ''
	}
}

export const getOnString = (on: number, type: ComplainType) => {
	if (on === 0) return getTypeString(type)
	return `${getTypeString(type)} на ${on}${getMinutesString(on, '')}`
}

export const getHumanDate = (date: string) => {
	const time = calculateHowMuchIsLeft(date)
	const d = new Date(date)
	const min = d.getMinutes() < 9 ? `0${d.getMinutes()}` : d.getMinutes()
	if (!time || time.hours === null || time.hours >= 1) return `в ${d.getHours()}:${min}`

	if (time.minutes === null) return

	return `${time.minutes === 0 ? '' : time.minutes}${getMinutesString(time.minutes)}`
}
