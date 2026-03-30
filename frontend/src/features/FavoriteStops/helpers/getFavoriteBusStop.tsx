import { STOPS_IN_LB } from 'shared/store/busStop/const/stopsInLbOptions'
import { STOPS_IN_SP } from 'shared/store/busStop/const/stopsInSpOptions'
import { STOPS_OUT } from 'shared/store/busStop/const/stopsOutOptions'
import { StopKeys } from 'shared/store/busStop/Stops'

const ALL_STOP_LABELS = new Set<string>([
	...STOPS_IN_SP.map(s => s.label),
	...STOPS_OUT.map(s => s.label),
	...STOPS_IN_LB.map(s => s.label),
])

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
