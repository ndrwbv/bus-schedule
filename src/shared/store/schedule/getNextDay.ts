
export const getNextDay = (currentDay: number) => {
	if (currentDay === 6)
		return 0;
	return currentDay + 1;
};
