import { ITime } from 'shared/store/timeLeft/ITime'

import { TColorTypes } from '../assets/icon'

export const colorDecider = (timeLeft: ITime): TColorTypes => {
	if (timeLeft.hours === null || timeLeft.minutes === null) return `BLACK`

	if (timeLeft.hours > 3) return `BLACK`
	if (timeLeft.minutes >= 40) return `BLUE`
	if (timeLeft.minutes >= 20 && timeLeft.minutes < 40) return `GREEN`
	if (timeLeft.minutes > 0 && timeLeft.minutes < 20) return `RED`

	return `BLACK`
}
