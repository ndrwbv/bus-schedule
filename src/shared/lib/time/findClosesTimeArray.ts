import { TIME_ZONE } from "../../../shared/configs/TIME_ZONE";


export const findClosesTimeArray = (hours: string[]): string[] => {
	const convertedDate = new Date().toLocaleString('en-US', { timeZone: TIME_ZONE });
	let closestTime: string[] = [];

	for (let i = 0; i < hours.length; i++) {
		const splitted = hours[i].split(':').map(item => parseInt(item, 10));

		const possibleDate = new Date(convertedDate).setHours(splitted[0], splitted[1]);

		if (possibleDate - new Date(convertedDate).getTime() > 0) {
			closestTime.push(hours[i]);
		}
	}

	return closestTime;
};
