import { interpolateStopTimes } from 'shared/lib/time/interpolateStopTimes'

import { ISchedule } from '../../schedule/ISchedule'
import { DirectionsNew, IOption, IStops, StopKeys, TaggedTime, UserDirection } from '../Stops'
import { STOPS_IN_LB } from './stopsInLbOptions'
import { STOPS_IN_SP } from './stopsInSpOptions'
import { STOPS_OUT } from './stopsOutOptions'

/** Ordered stop labels per direction — used for interpolation */
const STOP_ORDER_INSP = STOPS_IN_SP.map(s => s.label)
const STOP_ORDER_INLB = STOPS_IN_LB.map(s => s.label)
const STOP_ORDER_OUT = STOPS_OUT.map(s => s.label)

const STOP_ORDER: Record<string, string[]> = {
	[DirectionsNew.inSP]: STOP_ORDER_INSP,
	[DirectionsNew.out]: STOP_ORDER_OUT,
	[DirectionsNew.inLB]: STOP_ORDER_INLB,
}

/** Get times for a stop from a single direction, with interpolation fallback */
function getDirectionTimes(
	dirSchedule: Record<number, Record<string, string[]>> | undefined,
	dayKey: number,
	stopLabel: string,
	directionKey: string,
): { times: string[]; interpolated: boolean; fromStops: string } {
	const daySchedule = dirSchedule?.[dayKey] as Record<string, string[] | undefined> | undefined
	const raw = daySchedule?.[stopLabel]

	if (raw && raw.length > 0) {
		return { times: raw, interpolated: false, fromStops: `` }
	}

	// No times — try interpolation
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	const order = STOP_ORDER[directionKey] ?? []
	const result = interpolateStopTimes(daySchedule, stopLabel, order)

	if (!result) {
		return { times: [], interpolated: false, fromStops: `` }
	}

	return { times: result.times, interpolated: true, fromStops: result.fromStops }
}

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

function mapToTagged(
	result: { times: string[]; interpolated: boolean; fromStops: string },
	via: 'park' | 'lb' | null,
): TaggedTime[] {
	return result.times.map(t => ({
		time: t,
		via,
		interpolated: result.interpolated || undefined,
		interpolatedFrom: result.interpolated ? result.fromStops : undefined,
	}))
}

function sortTaggedTimes(tagged: TaggedTime[]): TaggedTime[] {
	return tagged.sort((a, b) => {
		const [ah, am] = a.time.split(`:`).map(Number)
		const [bh, bm] = b.time.split(`:`).map(Number)

		return ah * 60 + am - (bh * 60 + bm)
	})
}

export const getScheduleTimes = (
	schedule: ISchedule | null | undefined,
	userDirection: UserDirection,
	dayKey: number,
	stopLabel: string,
): TaggedTime[] => {
	if (userDirection === UserDirection.toCity) {
		const result = getDirectionTimes(schedule?.out, dayKey, stopLabel, DirectionsNew.out)

		return mapToTagged(result, null)
	}

	// fromCity: merge inSP + inLB (with interpolation fallback for each)
	const inSpResult = getDirectionTimes(schedule?.inSP, dayKey, stopLabel, DirectionsNew.inSP)
	const inLbResult = getDirectionTimes(schedule?.inLB, dayKey, stopLabel, DirectionsNew.inLB)

	const needsTag = inSpResult.times.length > 0 && inLbResult.times.length > 0
	const spVia = needsTag ? (`park` as const) : null
	const lbVia = needsTag ? (`lb` as const) : null

	const tagged: TaggedTime[] = [...mapToTagged(inSpResult, spVia), ...mapToTagged(inLbResult, lbVia)]

	return sortTaggedTimes(tagged)
}

export const userDirectionFromInternal = (direction: DirectionsNew): UserDirection =>
	direction === DirectionsNew.out ? UserDirection.toCity : UserDirection.fromCity
