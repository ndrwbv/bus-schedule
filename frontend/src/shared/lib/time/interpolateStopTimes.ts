/**
 * Interpolates approximate bus arrival times for stops that have no schedule data.
 *
 * When a stop has no times listed for a given day but the bus still passes through it,
 * we estimate arrival times based on neighboring stops in the route order.
 */

const toMinutes = (time: string): number => {
	const [h, m] = time.split(`:`).map(Number)

	return h * 60 + m
}

const formatMinutes = (total: number): string => {
	const h = Math.floor(total / 60)
	const m = Math.round(total % 60)
	const hours = h.toString().padStart(2, `0`)
	const minutes = m.toString().padStart(2, `0`)

	// same "06:05" shape the carrier's times have, so both kinds line up in lists
	return `${hours}:${minutes}`
}

const FALLBACK_GAP_MINUTES = 2

interface StopWithTimes {
	index: number
	label: string
	times: string[]
}

export interface InterpolationResult {
	times: string[]
	/** Human-readable description of the source stops, e.g. "Набережная и В. Маяковского" */
	fromStops: string
}

function findPrevStop(
	daySchedule: Record<string, string[] | undefined>,
	stopOrder: string[],
	stopIndex: number,
): StopWithTimes | null {
	for (let i = stopIndex - 1; i >= 0; i--) {
		const times = daySchedule[stopOrder[i]]
		if (times && times.length > 0) {
			return { index: i, label: stopOrder[i], times }
		}
	}

	return null
}

function findNextStop(
	daySchedule: Record<string, string[] | undefined>,
	stopOrder: string[],
	stopIndex: number,
): StopWithTimes | null {
	for (let i = stopIndex + 1; i < stopOrder.length; i++) {
		const times = daySchedule[stopOrder[i]]
		if (times && times.length > 0) {
			return { index: i, label: stopOrder[i], times }
		}
	}

	return null
}

/**
 * Share of the prev→next leg the stop sits at. With positions (distance along the route)
 * a stop 300 m past a known one gets 300 m worth of the leg's minutes; without them every
 * stop counts as an equal step, which skews long legs with unevenly spaced stops.
 */
function legFraction(
	stopIndex: number,
	prevIndex: number,
	nextIndex: number,
	stopPositions: number[] | undefined,
): number {
	if (stopPositions) {
		const span = stopPositions[nextIndex] - stopPositions[prevIndex]

		if (span > 0) return (stopPositions[stopIndex] - stopPositions[prevIndex]) / span
	}

	return (stopIndex - prevIndex) / (nextIndex - prevIndex)
}

function interpolateTrip(
	trip: number,
	stopIndex: number,
	prevStop: StopWithTimes | null,
	nextStop: StopWithTimes | null,
	stopPositions: number[] | undefined,
): string | null {
	const hasPrev = prevStop !== null && trip < prevStop.times.length
	const hasNext = nextStop !== null && trip < nextStop.times.length

	if (hasPrev && hasNext) {
		const prevMin = toMinutes(prevStop.times[trip])
		const nextMin = toMinutes(nextStop.times[trip])
		const fraction = legFraction(stopIndex, prevStop.index, nextStop.index, stopPositions)

		return formatMinutes(Math.round(prevMin + fraction * (nextMin - prevMin)))
	}

	if (hasPrev) {
		const delta = (stopIndex - prevStop.index) * FALLBACK_GAP_MINUTES

		return formatMinutes(toMinutes(prevStop.times[trip]) + delta)
	}

	if (hasNext) {
		const delta = (nextStop.index - stopIndex) * FALLBACK_GAP_MINUTES

		return formatMinutes(toMinutes(nextStop.times[trip]) - delta)
	}

	return null
}

function buildFromStopsLabel(prevStop: StopWithTimes | null, nextStop: StopWithTimes | null): string {
	if (prevStop && nextStop) {
		return `${prevStop.label} и ${nextStop.label}`
	}
	if (prevStop) {
		return prevStop.label
	}
	if (nextStop) {
		return nextStop.label
	}

	return ``
}

/**
 * Given a direction's schedule for a specific day, the stop label, and the ordered list
 * of stop labels, returns interpolated time strings and the source stop names.
 *
 * `stopPositions` (optional, same length as `stopOrder`) is the distance of each stop along
 * the route in any unit; when given, times are spread by distance instead of by stop count.
 */
export const interpolateStopTimes = (
	daySchedule: Record<string, string[] | undefined> | undefined,
	stopLabel: string,
	stopOrder: string[],
	stopPositions?: number[],
): InterpolationResult | null => {
	if (!daySchedule) return null

	const stopIndex = stopOrder.indexOf(stopLabel)
	if (stopIndex === -1) return null

	const prevStop = findPrevStop(daySchedule, stopOrder, stopIndex)
	const nextStop = findNextStop(daySchedule, stopOrder, stopIndex)

	if (!prevStop && !nextStop) return null

	// Trips are matched by array index, so neighbours with different trip counts describe
	// different trips at the same index — interpolating between them silently skews the result.
	// Better no times than wrong ones.
	if (prevStop && nextStop && prevStop.times.length !== nextStop.times.length) return null

	const tripCount = prevStop?.times.length ?? nextStop?.times.length ?? 0
	const result: string[] = []

	for (let trip = 0; trip < tripCount; trip++) {
		const time = interpolateTrip(trip, stopIndex, prevStop, nextStop, stopPositions)
		if (time !== null) {
			result.push(time)
		}
	}

	if (result.length === 0) return null

	return {
		times: result,
		fromStops: buildFromStopsLabel(prevStop, nextStop),
	}
}
