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
	const padded = m.toString().padStart(2, `0`)

	return `${String(h)}:${padded}`
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

function interpolateTrip(
	trip: number,
	stopIndex: number,
	prevStop: StopWithTimes | null,
	nextStop: StopWithTimes | null,
): string | null {
	const hasPrev = prevStop !== null && trip < prevStop.times.length
	const hasNext = nextStop !== null && trip < nextStop.times.length

	if (hasPrev && hasNext) {
		const prevMin = toMinutes(prevStop.times[trip])
		const nextMin = toMinutes(nextStop.times[trip])
		const fraction = (stopIndex - prevStop.index) / (nextStop.index - prevStop.index)

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
 */
export const interpolateStopTimes = (
	daySchedule: Record<string, string[] | undefined> | undefined,
	stopLabel: string,
	stopOrder: string[],
): InterpolationResult | null => {
	if (!daySchedule) return null

	const stopIndex = stopOrder.indexOf(stopLabel)
	if (stopIndex === -1) return null

	const prevStop = findPrevStop(daySchedule, stopOrder, stopIndex)
	const nextStop = findNextStop(daySchedule, stopOrder, stopIndex)

	if (!prevStop && !nextStop) return null

	const tripCount = prevStop?.times.length ?? nextStop?.times.length ?? 0
	const result: string[] = []

	for (let trip = 0; trip < tripCount; trip++) {
		const time = interpolateTrip(trip, stopIndex, prevStop, nextStop)
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
