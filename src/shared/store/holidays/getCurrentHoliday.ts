import { IHoliday, IHolidays } from 'shared/store/holidays/IHolidays';

export const getCurrentHoliday = (holidays: IHolidays): IHoliday[] => {
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	return holidays.filter(holiday => {
		const start = new Date(`${today.getFullYear()}-${holiday.start}`);
		const end = new Date(`${today.getFullYear()}-${holiday.end}`);
		start.setHours(0, 0, 0, 0);
		end.setHours(0, 0, 0, 0);

		if (today <= end && today >= start) {
			return true;
		}

		return false;
	});
};
