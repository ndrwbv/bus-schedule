import { interpolateStopTimes } from 'shared/lib/time/interpolateStopTimes'

import { NOVEMBER_STOPS } from '../busStop/const/novemberStops'
import type { TripStop } from '../busStop/const/stops'
import { STOPS_IN_LB } from '../busStop/const/stopsInLbOptions'
import { STOPS_OUT } from '../busStop/const/stopsOutOptions'
import { DirectionsNew, StopKeys, TaggedTime, UserDirection } from '../busStop/Stops'
import { CircuitTable, ISchedule } from './ISchedule'
import { tomskDate } from './serviceDate'

const CATALOG = [...STOPS_IN_LB, ...STOPS_OUT, ...NOVEMBER_STOPS]
const ALIASES: Record<string, StopKeys> = {
	'Лагерный сад': `Лагерный Сад`,
	'Серебряный бор': `Cеребряный бор`,
	'ул. А. Ахматовой': `Анны Ахматовой`,
	МАЯК: `Маяк`,
	'Левобережный, Синее небо': `Синее небо`,
	'Левобережный, Этюд': `Этюд`,
	'Левобережный, Гармония': `Гармония`,
	'Три Элемента': `Три элемента`,
	'Поликлиника (М. Цветаевой)': `Поликлиника`,
	Поликлиника: `Поликлиника (Алые Паруса)`,
}

export const usesCircuits = (schedule: ISchedule | null | undefined, date = tomskDate()): boolean =>
	!!schedule?.circuits && date >= schedule.circuits.effectiveFrom

const inboundDirection = (table: CircuitTable): DirectionsNew =>
	table.via === `park` ? DirectionsNew.inSP : DirectionsNew.inLB

/** Interpolate only between published city anchors within this particular trip. Never extrapolate a shortened trip. */
const addCityStops = (printed: TripStop[], direction: DirectionsNew): TripStop[] => {
	const order =
		direction === DirectionsNew.out
			? STOPS_OUT.slice(STOPS_OUT.findIndex(s => s.label === `Лагерный Сад`))
			: STOPS_IN_LB.slice(0, STOPS_IN_LB.findIndex(s => s.label === `Лагерный Сад`) + 1)
	const labels: string[] = order.map(s => s.label)
	const positions: number[] = [0]
	for (let i = 1; i < order.length; i++) {
		const [lat, lon] = order[i].latLon
		const [prevLat, prevLon] = order[i - 1].latLon
		positions.push(positions[i - 1] + Math.hypot(lat - prevLat, (lon - prevLon) * Math.cos((lat * Math.PI) / 180)))
	}

	return printed.flatMap((row, index) => {
		const next = printed[index + 1] as TripStop | undefined
		if (!next) return [row]
		const left = labels.indexOf(row.stop.label)
		const right = labels.indexOf(next.stop.label)
		if (left < 0 || right <= left + 1) return [row]
		const estimates = order.slice(left + 1, right).flatMap(stop => {
			const estimate = interpolateStopTimes(
				{ [row.stop.label]: [row.time], [next.stop.label]: [next.time] },
				stop.label,
				labels,
				positions,
			)

			return estimate ? [{ stop, time: estimate.times[0], interpolated: true }] : []
		})

		return [row, ...estimates]
	})
}

export const getCircuitTrip = (schedule: ISchedule, tripId: string, direction: DirectionsNew): TripStop[] => {
	const [tableId, column] = tripId.split(`:`)
	const table = schedule.circuits?.tables.find(t => t.id === tableId)
	const tripIndex = Number(column)
	if (!table || !Number.isInteger(tripIndex) || tripIndex < 0) return []
	if (direction !== DirectionsNew.out && direction !== inboundDirection(table)) return []
	const inbound = table.rows.filter(row => row.direction === `fromCity`)
	const rows =
		direction === DirectionsNew.out
			? [...inbound.slice(-1), ...table.rows.filter(row => row.direction === `toCity`)]
			: inbound
	const printed = rows.flatMap(row => {
		const time = row.times[tripIndex]
		if (!time) return []
		const label = ALIASES[row.stop] ?? row.stop
		const stop = CATALOG.find(
			s =>
				s.label === label &&
				(direction === DirectionsNew.out
					? s.direction === DirectionsNew.out
					: s.direction !== DirectionsNew.out),
		)

		return stop ? [{ stop, time, interpolated: false }] : []
	})
	if (direction !== DirectionsNew.out && printed.length < 2) return []

	return addCityStops(printed, direction)
}

export const getCircuitTimes = (
	schedule: ISchedule,
	userDirection: UserDirection,
	dayKey: number,
	label: string,
	serviceDate = tomskDate(),
): TaggedTime[] => {
	const tables =
		schedule.circuits?.tables.filter(t => t.day === (dayKey === 0 || dayKey === 6 ? `weekends` : `weekdays`)) ?? []

	return tables
		.flatMap(table => {
			const direction = userDirection === UserDirection.toCity ? DirectionsNew.out : inboundDirection(table)
			const via = direction === DirectionsNew.out ? (table.via === `park` ? `lb` : `park`) : table.via

			return (table.rows[0]?.times ?? []).flatMap((_, tripIndex) => {
				const tripId = `${table.id}:${tripIndex}`
				const stops = getCircuitTrip(schedule, tripId, direction)

				return stops.flatMap((row, visitIndex) => {
					if (row.stop.label !== label) return []
					const repeated = stops.filter(s => s.stop.label === label).length > 1
					const mayakIndex = stops.findIndex(s => s.stop.label === `Маяк`)

					return [
						{
							time: row.time,
							via,
							direction,
							dayKey,
							tripIndex,
							tripId,
							serviceDate,
							visitIndex,
							visitLabel: repeated ? (visitIndex < mayakIndex ? `к Маяку` : `от Маяка`) : undefined,
							interpolated: row.interpolated || undefined,
						},
					] satisfies TaggedTime[]
				})
			})
		})
		.sort((a, b) => a.time.localeCompare(b.time))
}

export const linkedCircuitLeg = (
	schedule: ISchedule,
	tripId: string,
	direction: DirectionsNew,
): DirectionsNew | null => {
	const table = schedule.circuits?.tables.find(t => t.id === tripId.split(`:`)[0])
	if (!table) return null
	const other = direction === DirectionsNew.out ? inboundDirection(table) : DirectionsNew.out
	// A trip starting at the turnaround has no preceding leg to show.

	return getCircuitTrip(schedule, tripId, other).length > 1 ? other : null
}
