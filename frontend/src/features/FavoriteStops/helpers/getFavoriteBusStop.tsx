import { StopKeys } from 'shared/store/busStop/Stops'

export const getFavoriteBusStop = (): StopKeys[] => {
	const localStorageItem = localStorage.getItem(`favoriteStops`)

	return localStorageItem ? (JSON.parse(localStorageItem) as StopKeys[]) : []
}
