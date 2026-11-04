import { STOPS } from 'shared/store/busStop/const/stops'
import { StopKeys } from 'shared/store/busStop/Stops'

const ALL_STOP_LABELS = new Set<string>(STOPS.map(stop => stop.label))

export const getFavoriteBusStop = (): StopKeys[] => {
	const localStorageItem = localStorage.getItem(`favoriteStops`)
	if (!localStorageItem) {
		return []
	}

	const parsed = JSON.parse(localStorageItem) as string[]
	const valid = parsed.filter((name): name is StopKeys => ALL_STOP_LABELS.has(name))

	if (valid.length !== parsed.length) {
		localStorage.setItem(`favoriteStops`, JSON.stringify(valid))
	}

	return valid
}
