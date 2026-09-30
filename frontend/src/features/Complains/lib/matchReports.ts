import { TIME_ZONE } from 'shared/configs/TIME_ZONE'
import { getScheduleTimes, getTrip, TripRef, userDirectionFromInternal } from 'shared/store/busStop/const/stops'
import { DirectionsNew, TaggedTime } from 'shared/store/busStop/Stops'
import { ISchedule } from 'shared/store/schedule/ISchedule'

import { ComplainType } from '../model/Complains'
import { IComplainsResponse } from '../model/useComplains'

/**
 * Passengers press «Приехал / Не приехал» at a stop. The report says only *when* and *where* —
 * this file works out *which trip* it is about, so a mark turns into «рейс 11:30 опоздал на 4 мин».
 *
 * Buses run every 25–40 minutes, so a window of −10…+25 min around the scheduled time is almost
 * always unambiguous. When it isn't, Fastreply lets the passenger pick the trip.
 */

/** A bus that came this much earlier than the timetable is already a stretch */
const MAX_EARLY = 10
/** …and this much later is about the limit before people call it «не приехал» */
const MAX_LATE = 25
/** «Не приехал» is about a trip that was due recently */
const NOT_ARRIVED_LOOKBACK = 40

export const toMinutes = (time: string): number => {
	const [h, m] = time.split(`:`).map(Number)

	return h * 60 + m
}

export const fromMinutes = (minutes: number): string => {
	const m = ((minutes % 1440) + 1440) % 1440

	const hh = String(Math.floor(m / 60)).padStart(2, `0`)
	const mm = String(m % 60).padStart(2, `0`)

	return `${hh}:${mm}`
}

/** Minutes since midnight in Tomsk, whatever the device's time zone is */
export const nowMinutesInTomsk = (): number => {
	const now = new Date(new Date().toLocaleString(`en-US`, { timeZone: TIME_ZONE }))

	return now.getHours() * 60 + now.getMinutes()
}

export const tripKey = (ref: TripRef): string => `${ref.direction}|${ref.dayKey}|${ref.tripIndex}`

/** «2026-09-30 11:34:38» (the API already returns Tomsk wall time) → minutes since midnight */
export const reportMinutes = (date: string): number => {
	const match = /(\d{2}):(\d{2})(?::\d{2})?$/.exec(date.trim())

	return match ? Number(match[1]) * 60 + Number(match[2]) : NaN
}

export interface TripCandidate {
	item: TaggedTime
	/** Minutes the bus is late relative to this trip (negative — early) */
	delay: number
}

/**
 * Trips a mark at `atMinutes` can be about, best guess first. Early buses are rarer than late
 * ones, so being early costs double.
 */
export const findCandidateTrips = (
	schedule: ISchedule | null | undefined,
	direction: DirectionsNew,
	dayKey: number,
	stop: string,
	atMinutes: number,
	type: ComplainType,
): TripCandidate[] => {
	const times = getScheduleTimes(schedule, userDirectionFromInternal(direction), dayKey, stop).filter(
		t => t.direction === direction,
	)

	const isNotArrived = type === ComplainType.not_arrive
	const cost = ({ delay }: TripCandidate): number => {
		if (isNotArrived) return delay >= 0 ? delay : -delay * 3

		return delay >= 0 ? delay : -delay * 2
	}

	return times
		.map(item => ({ item, delay: atMinutes - toMinutes(item.time) }))
		.filter(({ delay }) =>
			isNotArrived ? delay >= -3 && delay <= NOT_ARRIVED_LOOKBACK : delay >= -MAX_EARLY && delay <= MAX_LATE,
		)
		.sort((a, b) => cost(a) - cost(b))
}

export interface MatchedReport {
	id: number
	stop: string
	direction: DirectionsNew
	type: ComplainType
	/** Minutes since midnight, Tomsk */
	at: number
	trip: TripRef | null
	scheduledTime: string | null
	/** Only for «Приехал» */
	delay: number | null
	/** «Не приехал»: was the passenger here by the scheduled time (null — didn't answer) */
	wasOnTime: boolean | null
}

export const matchReport = (
	report: IComplainsResponse,
	schedule: ISchedule | null | undefined,
	dayKey: number,
): MatchedReport => {
	const direction = report.direction as DirectionsNew
	const type = report.type as ComplainType
	// «Пришёл 2 мин назад» — the arrival itself, not the moment of the tap
	const at = reportMinutes(report.arrived_at ?? report.date)
	const wasOnTime = report.was_on_time == null ? null : report.was_on_time === 1
	const base = { id: report.id, stop: report.stop, direction, type, at, wasOnTime }

	// The passenger picked the trip themselves — trust it
	if (report.scheduled_time && report.trip_index != null) {
		const delay = type === ComplainType.arrived ? report.delay_min ?? at - toMinutes(report.scheduled_time) : null

		return {
			...base,
			trip: { direction, dayKey: report.day_key ?? dayKey, tripIndex: report.trip_index },
			scheduledTime: report.scheduled_time,
			delay,
		}
	}

	const best = Number.isNaN(at)
		? undefined
		: findCandidateTrips(schedule, direction, dayKey, report.stop, at, type)[0]

	return {
		...base,
		trip: best ? { direction, dayKey, tripIndex: best.item.tripIndex } : null,
		scheduledTime: best?.item.time ?? null,
		delay: best && type === ComplainType.arrived ? best.delay : null,
	}
}

/** Position of each stop along a trip — to tell «before your stop» from «after» */
export const stopOrder = (schedule: ISchedule | null | undefined, trip: TripRef): Map<string, number> =>
	new Map(getTrip(schedule, trip.direction, trip.dayKey, trip.tripIndex).map((s, i) => [s.stop.label, i]))
