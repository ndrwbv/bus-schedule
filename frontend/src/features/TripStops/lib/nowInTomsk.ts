import { TIME_ZONE } from 'shared/configs/TIME_ZONE'

/** Minutes since midnight in Tomsk, whatever the device's time zone is */
export const nowMinutesInTomsk = (): number => {
	const now = new Date(new Date().toLocaleString(`en-US`, { timeZone: TIME_ZONE }))

	return now.getHours() * 60 + now.getMinutes()
}

export const timeToMinutes = (time: string): number => {
	const [h, m] = time.split(`:`).map(Number)

	return h * 60 + m
}
