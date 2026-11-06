import { ITime } from 'shared/store/timeLeft/ITime'

export type ArrivalStatus = 'imminent' | 'soon' | 'scheduled' | 'unavailable'

export const getArrivalStatus = ({ hours, minutes }: ITime): ArrivalStatus => {
	if (hours === null || minutes === null || hours > 3) return `unavailable`

	if (hours === 0 && minutes <= 15) return `imminent`
	if (hours === 0 && minutes < 35) return `soon`

	return `scheduled`
}
