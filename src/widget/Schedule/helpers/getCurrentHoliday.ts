import { IHoliday, IHolidays } from 'widget/Schedule/types/IHolidays';

export const getCurrentHoliday = (holidays: IHolidays): IHoliday[] => {
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	return holidays.filter(holiday => {
		const start = new Date(`${today.getFullYear()}-${holiday.start}`);
		const end = new Date(`${today.getFullYear()}-${holiday.end}`);

		if (today <= end && today >= start) {
			return true;
		}

		return false;
	});
};
