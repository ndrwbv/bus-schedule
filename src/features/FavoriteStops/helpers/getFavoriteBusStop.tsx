import { StopKeys } from 'widget/Schedule/types/Stops';


export const getFavoriteBusStop = (): StopKeys[] => {
	const localStorageItem = localStorage.getItem('favoriteStops');
	const favoriteStops = localStorageItem ? JSON.parse(localStorageItem) : [];

	return favoriteStops;
};
