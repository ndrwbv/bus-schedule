import type { IHoliday } from '../holidays/IHolidays'

/** Civil date in Tomsk, independent of the device timezone. ISO dates compare lexically. */
export const tomskDate = (now = new Date()): string =>
	new Intl.DateTimeFormat(`en-CA`, {
		timeZone: `Asia/Tomsk`,
		year: `numeric`,
		month: `2-digit`,
		day: `2-digit`,
	}).format(now)

export const addDays = (date: string, days: number): string => {
	const value = new Date(`${date}T12:00:00Z`)
	value.setUTCDate(value.getUTCDate() + days)

	return value.toISOString().slice(0, 10)
}

export const dayOfWeek = (date: string): number => new Date(`${date}T12:00:00Z`).getUTCDay()

export const scheduleDay = (date: string, holidays: IHoliday[]): number => {
	const day = date.slice(5)
	const holiday = holidays.find(item => day >= item.start && day <= item.end)

	return holiday ? holiday.key ?? 0 : dayOfWeek(date)
}

export const nextDateForDay = (date: string, day: number): string => addDays(date, (day - dayOfWeek(date) + 7) % 7)

/** First actual working day, including today; holiday overrides are applied before choosing it. */
export const nextWeekdayDate = (date: string, holidays: IHoliday[]): string => {
	for (let offset = 0; offset < 370; offset++) {
		const candidate = addDays(date, offset)
		const day = scheduleDay(candidate, holidays)
		if (day > 0 && day < 6) return candidate
	}

	return nextDateForDay(date, 1)
}
