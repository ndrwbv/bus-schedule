import { DirectionsNew, IOption, IStops, StopKeys, TaggedTime, UserDirection } from '../Stops'
import { STOPS_IN_LB } from './stopsInLbOptions'
import { STOPS_IN_SP } from './stopsInSpOptions'
import { STOPS_OUT } from './stopsOutOptions'
import { ISchedule } from '../../schedule/ISchedule'

export const STOPS = [...STOPS_IN_SP, ...STOPS_IN_LB, ...STOPS_OUT]

const seen = new Set<string>()
export const AllStopsOptions: IOption<StopKeys | null>[] = [
	{ label: `Не выбрано`, value: null },
	...STOPS.filter(s => {
		if (seen.has(s.label)) return false
		seen.add(s.label)
		return true
	}).map(s => ({ label: s.label, value: s.label as StopKeys })),
]

export const getUserDirectionsForLabel = (label: StopKeys): UserDirection[] => {
	const dirs: UserDirection[] = []
	const hasFromCity = STOPS.some(
		s => s.label === label && (s.direction === DirectionsNew.inSP || s.direction === DirectionsNew.inLB),
	)
	const hasToCity = STOPS.some(s => s.label === label && s.direction === DirectionsNew.out)
	if (hasFromCity) dirs.push(UserDirection.fromCity)
	if (hasToCity) dirs.push(UserDirection.toCity)
	return dirs
}

export const findStopForUserDirection = (
	label: StopKeys,
	userDirection: UserDirection,
): IStops<DirectionsNew> | undefined => {
	if (userDirection === UserDirection.toCity) {
		return STOPS.find(s => s.label === label && s.direction === DirectionsNew.out)
	}
	// fromCity: prefer inSP, fall back to inLB
	return (
		STOPS.find(s => s.label === label && s.direction === DirectionsNew.inSP) ||
		STOPS.find(s => s.label === label && s.direction === DirectionsNew.inLB)
	)
}

export const getScheduleTimes = (
	schedule: ISchedule,
	userDirection: UserDirection,
	dayKey: number,
	stopLabel: string,
): TaggedTime[] => {
	if (userDirection === UserDirection.toCity) {
		const times =
			(schedule.out?.[dayKey] as Record<string, string[] | undefined> | undefined)?.[stopLabel] ?? []
		return times.map(t => ({ time: t, via: null }))
	}

	// fromCity: merge inSP + inLB
	const inSpTimes =
		(schedule.inSP?.[dayKey] as Record<string, string[] | undefined> | undefined)?.[stopLabel] ?? []
	const inLbTimes =
		(schedule.inLB?.[dayKey] as Record<string, string[] | undefined> | undefined)?.[stopLabel] ?? []

	const needsTag = inSpTimes.length > 0 && inLbTimes.length > 0

	const tagged: TaggedTime[] = [
		...inSpTimes.map(t => ({ time: t, via: needsTag ? (`park` as const) : null })),
		...inLbTimes.map(t => ({ time: t, via: needsTag ? (`lb` as const) : null })),
	]

	tagged.sort((a, b) => {
		const [ah, am] = a.time.split(`:`).map(Number)
		const [bh, bm] = b.time.split(`:`).map(Number)
		return ah * 60 + am - (bh * 60 + bm)
	})

	return tagged
}

export const userDirectionFromInternal = (direction: DirectionsNew): UserDirection =>
	direction === DirectionsNew.out ? UserDirection.toCity : UserDirection.fromCity
