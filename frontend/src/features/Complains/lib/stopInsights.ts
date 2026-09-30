import { getScheduleTimes, userDirectionFromInternal } from 'shared/store/busStop/const/stops'
import { DirectionsNew, TaggedTime } from 'shared/store/busStop/Stops'
import { ISchedule } from 'shared/store/schedule/ISchedule'

import { ComplainType, DelayStat } from '../model/Complains'
import { MatchedReport, stopOrder, toMinutes, tripKey } from './matchReports'

/**
 * What passengers upstream said about a trip that is due at your stop now, from the freshest mark:
 * `timing` — «на ЦУМ отметили +6 мин» (or −3, or вовремя), `missing` — «на ЦУМ он не пришёл».
 */
export interface LiveSignal {
	kind: 'timing' | 'missing'
	trip: TaggedTime
	/** Where the freshest mark was left */
	fromStop: string
	/** Minutes since midnight, when that mark was left */
	markedAt: number
	marks: number
	delay: number
	/** When the bus should reach your stop, taking the delay into account */
	expected: number
}

export interface UsualDelay {
	median: number
	p25: number
	p75: number
	count: number
	days: number
	/** `trip` — this very trip at this stop has enough marks, `stop` — all trips at this stop */
	scope: 'trip' | 'stop'
}

export interface FeedItem {
	key: string
	type: ComplainType
	scheduledTime: string | null
	/** Latest mark in the group */
	at: number
	count: number
	delay: number | null
}

export interface StopInsights {
	live: LiveSignal[]
	usual: UsualDelay | null
	feed: FeedItem[]
}

/** Don't claim «обычно» from one person's bad morning */
const TRIP_MIN_MARKS = 3
const TRIP_MIN_DAYS = 2
const STOP_MIN_MARKS = 5
const STOP_MIN_DAYS = 3
/** Trips due within this window get a live signal */
const LOOKAHEAD = 60
/** A mark older than this says little about where the bus is now */
const SIGNAL_TTL = 50
/** Marks at one stop this close in time are the same bus seen by several people */
const FRESH_GROUP = 5

const median = (values: number[]): number => {
	const sorted = [...values].sort((a, b) => a - b)
	const mid = Math.floor(sorted.length / 2)

	return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2)
}

const buildLiveSignals = (
	reports: MatchedReport[],
	schedule: ISchedule | null | undefined,
	dayKey: number,
	stop: string,
	direction: DirectionsNew,
	now: number,
): LiveSignal[] => {
	const byTrip = new Map<string, MatchedReport[]>()
	reports.forEach(r => {
		if (!r.trip || now - r.at > SIGNAL_TTL) return
		const key = tripKey(r.trip)
		byTrip.set(key, [...(byTrip.get(key) ?? []), r])
	})

	const trips = getScheduleTimes(schedule, userDirectionFromInternal(direction), dayKey, stop)

	return trips.flatMap((trip): LiveSignal[] => {
		const scheduled = toMinutes(trip.time)
		if (scheduled < now - 25 || scheduled > now + LOOKAHEAD) return []

		const marks = byTrip.get(tripKey(trip))
		if (!marks) return []

		const order = stopOrder(schedule, trip)
		const myPos = order.get(stop) ?? -1
		// Someone at your stop or further along already saw it — the bus is gone
		const passed = marks.some(
			m => m.type === ComplainType.arrived && (m.stop === stop || (order.get(m.stop) ?? -1) > myPos),
		)
		if (passed) return []

		// The freshest mark wins: it is the latest known position of *this* bus. Ties go to the stop
		// closer to yours
		const upstream = marks
			.filter(m => (order.get(m.stop) ?? Infinity) < myPos)
			.filter(m => (m.type === ComplainType.arrived && m.delay !== null) || m.type === ComplainType.not_arrive)
			.sort((a, b) => b.at - a.at || (order.get(b.stop) ?? 0) - (order.get(a.stop) ?? 0))
		const freshest = upstream[0] as MatchedReport | undefined
		if (!freshest) return []

		const arrived = upstream.filter(m => m.type === ComplainType.arrived)
		const lastArrived = arrived[0] as MatchedReport | undefined
		// People standing together press within a couple of minutes — those agree on one moment
		const sameMoment = (m: MatchedReport, ref: MatchedReport): boolean =>
			m.stop === ref.stop && ref.at - m.at <= FRESH_GROUP
		const arrivedDelay = lastArrived
			? median(arrived.filter(m => sameMoment(m, lastArrived)).map(m => m.delay as number))
			: null
		// «Не приехал» at a stop means the bus is at least this late there
		const missingDelay =
			freshest.type === ComplainType.not_arrive && freshest.scheduledTime
				? freshest.at - toMinutes(freshest.scheduledTime)
				: null

		const base = {
			trip,
			fromStop: freshest.stop,
			markedAt: freshest.at,
			marks: upstream.filter(m => sameMoment(m, freshest) && m.type === freshest.type).length,
		}

		if (!lastArrived || (missingDelay === null && freshest.type === ComplainType.not_arrive)) {
			return [{ ...base, kind: `missing`, delay: missingDelay ?? 0, expected: scheduled }]
		}

		// Seen upstream, then not seen further along later — it is later than the old mark said
		const delay = Math.max(arrivedDelay as number, missingDelay ?? -Infinity)
		const expected = scheduled + delay
		// Expected a while ago and nobody here marked it — don't keep promising
		if (expected < now - 5) return []

		return [{ ...base, kind: `timing`, delay, expected }]
	})
}

const buildUsual = (
	stats: DelayStat[],
	stop: string,
	direction: DirectionsNew,
	nextTripTime: string | null,
): UsualDelay | null => {
	const forStop = stats.filter(s => s.stop === stop && s.direction === (direction as string))
	const trip = nextTripTime ? forStop.find(s => s.scheduledTime === nextTripTime) : undefined

	if (trip && trip.count >= TRIP_MIN_MARKS && trip.days >= TRIP_MIN_DAYS) return { ...trip, scope: `trip` }

	const all = forStop.find(s => s.scheduledTime === null)
	if (all && all.count >= STOP_MIN_MARKS && all.days >= STOP_MIN_DAYS) return { ...all, scope: `stop` }

	return null
}

const buildFeed = (reports: MatchedReport[], stop: string, direction: DirectionsNew): FeedItem[] => {
	const groups = new Map<string, MatchedReport[]>()
	reports
		.filter(r => r.stop === stop && r.direction === direction)
		.forEach(r => {
			const key = [r.scheduledTime ?? `@${String(r.at)}`, r.type].join(`|`)
			groups.set(key, [...(groups.get(key) ?? []), r])
		})

	return [...groups.entries()]
		.map(([key, list]) => {
			const delays = list.map(r => r.delay).filter((d): d is number => d !== null)

			return {
				key,
				type: list[0].type,
				scheduledTime: list[0].scheduledTime,
				at: Math.max(...list.map(r => r.at)),
				count: list.length,
				delay: delays.length > 0 ? median(delays) : null,
			}
		})
		.sort((a, b) => b.at - a.at)
}

export const buildStopInsights = ({
	reports,
	stats,
	schedule,
	dayKey,
	stop,
	direction,
	now,
	nextTripTime,
}: {
	reports: MatchedReport[]
	stats: DelayStat[]
	schedule: ISchedule | null | undefined
	dayKey: number
	stop: string
	direction: DirectionsNew
	now: number
	nextTripTime: string | null
}): StopInsights => ({
	live: buildLiveSignals(reports, schedule, dayKey, stop, direction, now),
	usual: buildUsual(stats, stop, direction, nextTripTime),
	feed: buildFeed(reports, stop, direction),
})
