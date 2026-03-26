import { ITime } from 'shared/store/timeLeft/ITime'

export const getLeftString = (timeLeft: ITime): { text: string; unit: string | null } => {
	if (timeLeft.hours === null || timeLeft.minutes === null || timeLeft.hours > 3)
		return {
			text: `(^__^)`,
			unit: null,
		}

	if (timeLeft.hours !== 0)
		return {
			text: `>${timeLeft.hours}`,
			unit: `час`,
		}

	return {
		text: `${timeLeft.minutes}`,
		unit: `мин`,
	}
}
