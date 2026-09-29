import { interpolateStopTimes } from 'shared/lib/time/interpolateStopTimes'

import { ISchedule } from '../../schedule/ISchedule'
import { DirectionsNew, IOption, IStops, StopKeys, TaggedTime, UserDirection } from '../Stops'
import { STOPS_IN_LB } from './stopsInLbOptions'
import { STOPS_IN_SP } from './stopsInSpOptions'
import { STOPS_OUT } from './stopsOutOptions'

/** Ordered stops per direction — the array order is the physical order along the route */
export const STOPS_BY_DIRECTION: Record<DirectionsNew, IStops<DirectionsNew>[]> = {
	[DirectionsNew.inSP]: STOPS_IN_SP,
	[DirectionsNew.out]: STOPS_OUT,
	[DirectionsNew.inLB]: STOPS_IN_LB,
}

const EARTH_RADIUS_M = 6371000

const distanceMeters = ([lat1, lon1]: [number, number], [lat2, lon2]: [number, number]): number => {
	const toRad = (deg: number): number => (deg * Math.PI) / 180
	const dLat = toRad(lat2 - lat1)
	const dLon = toRad(lon2 - lon1)
	const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2

	return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(a))
}

/** Cumulative straight-line distance of every stop from the first one — good enough to weight interpolation */
const routePositions = (stops: IStops<DirectionsNew>[]): number[] => {
	const positions: number[] = []

	stops.forEach((stop, i) => {
		positions.push(i === 0 ? 0 : positions[i - 1] + distanceMeters(stops[i - 1].latLon, stop.latLon))
	})

	return positions
}

/** Ordered stop labels + their positions per direction — used for interpolation */
const STOP_ORDER: Record<string, { labels: string[]; positions: number[] }> = Object.fromEntries(
	Object.entries(STOPS_BY_DIRECTION).map(([direction, stops]) => [
		direction,
		{ labels: stops.map(s => s.label), positions: routePositions(stops) },
	]),
)

export interface StopTimesResult {
	times: string[]
	interpolated: boolean
	fromStops: string
}

/** Get times for a stop from a single direction, with interpolation fallback */
function getDirectionTimes(
	dirSchedule: Record<number, Record<string, string[]>> | undefined,
	dayKey: number,
	stopLabel: string,
	directionKey: string,
): StopTimesResult {
	const daySchedule = dirSchedule?.[dayKey] as Record<string, string[] | undefined> | undefined
	const raw = daySchedule?.[stopLabel]

	if (raw && raw.length > 0) {
		return { times: raw, interpolated: false, fromStops: `` }
	}

	// No times — try interpolation
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	const order = STOP_ORDER[directionKey] ?? { labels: [], positions: [] }
	const result = interpolateStopTimes(daySchedule, stopLabel, order.labels, order.positions)

	if (!result) {
		return { times: [], interpolated: false, fromStops: `` }
	}

	return { times: result.times, interpolated: true, fromStops: result.fromStops }
}

/** Times of one stop in one internal direction (printed by the carrier or estimated from neighbours) */
export const getStopTimes = (
	schedule: ISchedule | null | undefined,
	direction: DirectionsNew,
	dayKey: number,
	stopLabel: string,
): StopTimesResult => getDirectionTimes(schedule?.[direction], dayKey, stopLabel, direction)

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
	result: StopTimesResult,
	via: 'park' | 'lb' | null,
	direction: DirectionsNew,
	dayKey: number,
): TaggedTime[] {
	return result.times.map((t, tripIndex) => ({
		time: t,
		via,
		direction,
		dayKey,
		tripIndex,
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

		return mapToTagged(result, null, DirectionsNew.out, dayKey)
	}

	// fromCity: merge inSP + inLB (with interpolation fallback for each)
	const inSpResult = getDirectionTimes(schedule?.inSP, dayKey, stopLabel, DirectionsNew.inSP)
	const inLbResult = getDirectionTimes(schedule?.inLB, dayKey, stopLabel, DirectionsNew.inLB)

	// Every "from city" trip carries its branch. After Лагерный Сад the route splits into
	// Северный парк and Левобережный, and the departure time alone doesn't say which one it is —
	// so tag even the stops served by a single branch: "через парк" on all of them is what tells
	// a passenger that no bus from here goes to Левобережный.
	//
	// Unless there is nothing to disambiguate: since September 2026 every from-city trip runs
	// through Левобережный and inSP arrives empty, so "через ЛБ" on every single row would be
	// noise. Tag only while both branches actually run that day.
	const hasBothBranches =
		Object.keys(schedule?.inSP[dayKey] ?? {}).length > 0 && Object.keys(schedule?.inLB[dayKey] ?? {}).length > 0
	const spVia = hasBothBranches ? (`park` as const) : null
	const lbVia = hasBothBranches ? (`lb` as const) : null

	const tagged: TaggedTime[] = [
		...mapToTagged(inSpResult, spVia, DirectionsNew.inSP, dayKey),
		...mapToTagged(inLbResult, lbVia, DirectionsNew.inLB, dayKey),
	]

	return sortTaggedTimes(tagged)
}

export const userDirectionFromInternal = (direction: DirectionsNew): UserDirection =>
	direction === DirectionsNew.out ? UserDirection.toCity : UserDirection.fromCity

export interface TripStop {
	stop: IStops<DirectionsNew>
	time: string
	interpolated: boolean
}

/** Every stop of one trip, in route order. Stops the trip has no time for are skipped */
export const getTrip = (
	schedule: ISchedule | null | undefined,
	direction: DirectionsNew,
	dayKey: number,
	tripIndex: number,
): TripStop[] =>
	STOPS_BY_DIRECTION[direction].flatMap(stop => {
		const result = getStopTimes(schedule, direction, dayKey, stop.label)
		const time = result.times[tripIndex] as string | undefined

		return time ? [{ stop, time, interpolated: result.interpolated }] : []
	})

const toMinutes = (time: string): number => {
	const [h, m] = time.split(`:`).map(Number)

	return h * 60 + m
}

/**
 * How long the bus may stand at Cеребряный бор between the legs. In the carrier's table the
 * "from city" arrival and the "to city" departure there are the same cell, so the gap is 0 —
 * the margin only absorbs a future table printing them a few minutes apart.
 */
const MAX_LAYOVER_MINUTES = 10

export interface TripRef {
	direction: DirectionsNew
	dayKey: number
	tripIndex: number
}

const otherLegDirections = (direction: DirectionsNew): DirectionsNew[] =>
	direction === DirectionsNew.out ? [DirectionsNew.inLB, DirectionsNew.inSP] : [DirectionsNew.out]

const tripCount = (schedule: ISchedule | null | undefined, direction: DirectionsNew, dayKey: number): number =>
	Math.max(0, ...Object.values(schedule?.[direction][dayKey] ?? {}).map(times => times.length))

/**
 * The carrier runs one loop: the "from city" leg ends at Cеребряный бор and the same bus leaves
 * from there "to city" — one column of the carrier's table. Finds that other half: `next` for a
 * "from city" leg, `prev` for a "to city" one.
 *
 * Only this turnaround is linked. Which departure a bus takes after arriving at
 * Интернационалистов is not in the table, and a guess by time would show a wrong bus.
 */
export const findLinkedLeg = (
	schedule: ISchedule | null | undefined,
	trip: TripRef,
	kind: 'next' | 'prev',
): TripRef | null => {
	const isToCity = trip.direction === DirectionsNew.out
	if ((kind === `next`) === isToCity) return null

	const stops = getTrip(schedule, trip.direction, trip.dayKey, trip.tripIndex)
	if (stops.length === 0) return null

	const edge = toMinutes(kind === `next` ? stops[stops.length - 1].time : stops[0].time)
	let best: { ref: TripRef; gap: number } | null = null

	otherLegDirections(trip.direction).forEach(direction => {
		for (let tripIndex = 0; tripIndex < tripCount(schedule, direction, trip.dayKey); tripIndex++) {
			const candidate = getTrip(schedule, direction, trip.dayKey, tripIndex)
			// eslint-disable-next-line no-continue
			if (candidate.length === 0) continue

			const gap =
				kind === `next`
					? toMinutes(candidate[0].time) - edge
					: edge - toMinutes(candidate[candidate.length - 1].time)

			if (gap >= 0 && gap <= MAX_LAYOVER_MINUTES && (!best || gap < best.gap)) {
				best = { ref: { direction, dayKey: trip.dayKey, tripIndex }, gap }
			}
		}
	})

	return (best as { ref: TripRef } | null)?.ref ?? null
}
