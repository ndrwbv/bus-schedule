/**
 * Interpolates approximate bus arrival times for stops that have no schedule data.
 *
 * When a stop has no times listed for a given day but the bus still passes through it,
 * we estimate arrival times based on neighboring stops in the route order.
 *
 * Returns an array of time strings (e.g. ["8:51", "11:01"]) or empty array if cannot interpolate.
 */

const toMinutes = (time: string): number => {
	const [h, m] = time.split(`:`).map(Number)
	return h * 60 + m
}

const fromMinutes = (totalMinutes: number): string => {
	const h = Math.floor(totalMinutes)
	const m = Math.round((totalMinutes - h) * 60)
	// Handle overflow
	const hours = Math.floor((h * 60 + m) / 60)
	const mins = (h * 60 + m) % 60
	return `${hours}:${mins.toString().padStart(2, `0`)}`
}

const fromTotalMinutes = (total: number): string => {
	const h = Math.floor(total / 60)
	const m = Math.round(total % 60)
	return `${h}:${m.toString().padStart(2, `0`)}`
}

interface StopWithTimes {
	index: number
	times: string[]
}

/**
 * Given a direction's schedule for a specific day, the stop label, and the ordered list
 * of stop labels, returns interpolated time strings for the stop.
 *
 * @param daySchedule - Record<stopLabel, timeArray> for one direction/day
 * @param stopLabel - The stop we need times for
 * @param stopOrder - Ordered array of stop labels for this direction
 * @returns Array of interpolated time strings, or empty if interpolation is not possible
 */
export const interpolateStopTimes = (
	daySchedule: Record<string, string[] | undefined> | undefined,
	stopLabel: string,
	stopOrder: string[],
): string[] => {
	if (!daySchedule) return []

	const stopIndex = stopOrder.indexOf(stopLabel)
	if (stopIndex === -1) return []

	// Find previous stop with times
	let prevStop: StopWithTimes | null = null
	for (let i = stopIndex - 1; i >= 0; i--) {
		const times = daySchedule[stopOrder[i]]
		if (times && times.length > 0) {
			prevStop = { index: i, times }
			break
		}
	}

	// Find next stop with times
	let nextStop: StopWithTimes | null = null
	for (let i = stopIndex + 1; i < stopOrder.length; i++) {
		const times = daySchedule[stopOrder[i]]
		if (times && times.length > 0) {
			nextStop = { index: i, times }
			break
		}
	}

	if (!prevStop && !nextStop) return []

	const tripCount = prevStop?.times.length ?? nextStop?.times.length ?? 0
	const result: string[] = []

	for (let trip = 0; trip < tripCount; trip++) {
		const hasPrev = prevStop && trip < prevStop.times.length
		const hasNext = nextStop && trip < nextStop.times.length

		if (hasPrev && hasNext) {
			// Linear interpolation between prev and next
			const prevMin = toMinutes(prevStop.times[trip])
			const nextMin = toMinutes(nextStop.times[trip])
			const fraction = (stopIndex - prevStop.index) / (nextStop.index - prevStop.index)
			const interpolated = prevMin + fraction * (nextMin - prevMin)
			result.push(fromTotalMinutes(Math.round(interpolated)))
		} else if (hasPrev) {
			// Only prev available — estimate ~2 min per stop gap
			const prevMin = toMinutes(prevStop.times[trip])
			const delta = (stopIndex - prevStop.index) * 2
			result.push(fromTotalMinutes(prevMin + delta))
		} else if (hasNext) {
			// Only next available — estimate ~2 min per stop gap back
			const nextMin = toMinutes(nextStop.times[trip])
			const delta = (nextStop.index - stopIndex) * 2
			result.push(fromTotalMinutes(nextMin - delta))
		}
	}

	return result
}
