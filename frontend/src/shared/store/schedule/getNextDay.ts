export const getNextDay = (currentDay: number): number => {
	if (currentDay === 6) return 0

	return currentDay + 1
}
