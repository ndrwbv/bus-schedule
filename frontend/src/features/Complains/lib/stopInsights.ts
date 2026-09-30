import { getScheduleTimes, TripRef, userDirectionFromInternal } from 'shared/store/busStop/const/stops'
import { DirectionsNew, TaggedTime } from 'shared/store/busStop/Stops'
import { ISchedule } from 'shared/store/schedule/ISchedule'

import { ComplainType, DelayStat } from '../model/Complains'
import { MatchedReport, stopOrder, toMinutes, tripKey } from './matchReports'

/**
 * What the marks say about the trip due at your stop now, from the freshest one. `atLeast` —
 * the number comes from «не приехал»: the bus was not there yet, so it is late by *at least* that.
 */
export interface LiveSignal {
	trip: TaggedTime
	/** Where the freshest mark was left */
	fromStop: string
	/** Minutes since midnight, when that mark was left */
	markedAt: number
	fromType: ComplainType.arrived | ComplainType.not_arrive
	marks: number
	delay: number
	atLeast: boolean
	/** When the bus should reach your stop, taking the delay into account */
	expected: number
}

/**
 * «Не приехал» only says the passenger did not see the bus. It was either late — or it left before
 * they came. So a mark is read against the rest of the trip, and without support it stays a fact.
 */
export type NotArrivedMeaning =
	/** Confirmed: the bus had not come yet, so it was late by at least this many minutes */
	| { kind: 'late'; atLeast: number }
	/** Other stops show the bus passed here before the mark — the passenger missed it */
	| { kind: 'passedBefore'; passedAt: number }
	/** Nobody saw this trip anywhere, and the next one has already come here */
	| { kind: 'cancelled' }
	/** A lone mark: only «at that time it was not here» */
	| { kind: 'unknown' }

export interface UsualDelay {
	median: number
	p25: number
	p75: number
	count: number
	days: number
	/** `trip` — this very trip at this stop has enough marks, `stop` — all trips at this stop */
	scope: 'trip' | 'stop'
}

/** One trip at this stop today, everything marked about it folded into one status */
export interface FeedItem {
	key: string
	scheduledTime: string | null
	status: 'arrived' | 'passedBy' | 'passedBefore' | 'cancelled' | 'notYet'
	/**
	 * arrived — first «Приехал» (the closest to the real arrival), passedBefore — estimated pass time,
	 * notYet — the latest «Не приехал», passedBy — the mark
	 */
	at: number
	/** Latest mark — for ordering */
	lastAt: number
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

/** A «не приехал» pressed right at the scheduled time says nothing yet */
const MIN_WAIT = 2

const groupByTrip = (reports: MatchedReport[]): Map<string, MatchedReport[]> => {
	const byTrip = new Map<string, MatchedReport[]>()
	reports.forEach(r => {
		if (!r.trip) return
		const key = tripKey(r.trip)
		byTrip.set(key, [...(byTrip.get(key) ?? []), r])
	})

	return byTrip
}

/**
 * Reads one «Не приехал» against the other marks of the same trip (`tripMarks`, any stop).
 * `nextTripHere` — marks of the next trip at the same stop, to spot a trip that never came.
 */
export const classifyNotArrived = (
	mark: MatchedReport,
	tripMarks: MatchedReport[],
	nextTripHere: MatchedReport[],
): NotArrivedMeaning => {
	if (!mark.scheduledTime) return { kind: `unknown` }

	const scheduled = toMinutes(mark.scheduledTime)
	const waited = mark.at - scheduled
	const arrived = tripMarks.filter(m => m.type === ComplainType.arrived)
	const arrivedHere = arrived.filter(m => m.stop === mark.stop)

	// Seen here: before the mark — it left before this passenger came; after — it was late
	const before = arrivedHere.find(m => m.at < mark.at)
	if (before) return { kind: `passedBefore`, passedAt: before.at }
	if (arrivedHere.length > 0) return waited >= MIN_WAIT ? { kind: `late`, atLeast: waited } : { kind: `unknown` }

	// Seen at another stop: where was it at the moment of the mark?
	const elsewhere = arrived.filter(m => m.delay !== null).sort((a, b) => b.at - a.at)[0] as MatchedReport | undefined
	if (elsewhere) {
		const passedAt = scheduled + (elsewhere.delay as number)
		if (passedAt < mark.at - 1) return { kind: `passedBefore`, passedAt }

		return waited >= MIN_WAIT ? { kind: `late`, atLeast: waited } : { kind: `unknown` }
	}

	if (nextTripHere.some(m => m.type === ComplainType.arrived)) return { kind: `cancelled` }

	// Nothing else about this bus: trust the passenger's own answer, or several people agreeing
	const agreeing = tripMarks.filter(m => m.stop === mark.stop && m.type === ComplainType.not_arrive).length
	if (waited >= MIN_WAIT && (mark.wasOnTime === true || agreeing >= 2)) return { kind: `late`, atLeast: waited }

	return { kind: `unknown` }
}

const nextTripKey = (trip: TripRef): string => tripKey({ ...trip, tripIndex: trip.tripIndex + 1 })

const buildLiveSignals = (
	reports: MatchedReport[],
	schedule: ISchedule | null | undefined,
	dayKey: number,
	stop: string,
	direction: DirectionsNew,
	now: number,
): LiveSignal[] => {
	const byTrip = groupByTrip(reports)
	const trips = getScheduleTimes(schedule, userDirectionFromInternal(direction), dayKey, stop)

	return trips.flatMap((trip): LiveSignal[] => {
		const scheduled = toMinutes(trip.time)
		if (scheduled < now - 25 || scheduled > now + LOOKAHEAD) return []

		const all = byTrip.get(tripKey(trip))
		if (!all) return []
		const marks = all.filter(m => now - m.at <= SIGNAL_TTL)

		const order = stopOrder(schedule, trip)
		const myPos = order.get(stop) ?? -1
		const nextHere = (byTrip.get(nextTripKey(trip)) ?? []).filter(m => m.stop === stop)
		const meaning = (m: MatchedReport): NotArrivedMeaning =>
			classifyNotArrived(
				m,
				all,
				(byTrip.get(nextTripKey(m.trip as TripRef)) ?? []).filter(n => n.stop === m.stop),
			)

		// Someone at your stop or further along already saw it, or it left before a passenger here
		// came — the bus is gone
		const passed =
			marks.some(
				m => m.type === ComplainType.arrived && (m.stop === stop || (order.get(m.stop) ?? -1) > myPos),
			) ||
			marks.some(
				m => m.type === ComplainType.not_arrive && m.stop === stop && meaning(m).kind === `passedBefore`,
			) ||
			nextHere.some(m => m.type === ComplainType.arrived)
		if (passed) return []

		// Evidence: «Приехал» before your stop (exact), confirmed «не приехал» here or before (a lower
		// bound). The freshest wins — it is the latest known position of *this* bus. Ties go to the
		// stop closer to yours
		const evidence = marks
			.filter(m => (order.get(m.stop) ?? Infinity) <= myPos)
			.flatMap(m => {
				if (m.type === ComplainType.arrived && m.stop !== stop && m.delay !== null)
					return [{ mark: m, delay: m.delay, atLeast: false }]
				if (m.type !== ComplainType.not_arrive) return []
				const read = meaning(m)

				return read.kind === `late` ? [{ mark: m, delay: read.atLeast, atLeast: true }] : []
			})
			.sort((a, b) => b.mark.at - a.mark.at || (order.get(b.mark.stop) ?? 0) - (order.get(a.mark.stop) ?? 0))
		const freshest = evidence[0] as (typeof evidence)[number] | undefined
		if (!freshest) return []

		// People standing together press within a couple of minutes — those agree on one moment
		const sameMoment = evidence.filter(
			e =>
				e.mark.stop === freshest.mark.stop &&
				e.mark.type === freshest.mark.type &&
				freshest.mark.at - e.mark.at <= FRESH_GROUP,
		)
		const lastExact = evidence.find(e => !e.atLeast)
		let delay = freshest.atLeast ? freshest.delay : median(sameMoment.map(e => e.delay))
		let { atLeast } = freshest
		// «Not there yet» after an older «+8 upstream»: the bus is at least as late as either says
		if (atLeast && lastExact && lastExact.delay >= delay) {
			delay = lastExact.delay
			atLeast = false
		}

		const expected = scheduled + delay
		// Expected a while ago and nobody here marked it — don't keep promising
		if (!atLeast && expected < now - 5) return []

		return [
			{
				trip,
				fromStop: freshest.mark.stop,
				markedAt: freshest.mark.at,
				fromType: freshest.mark.type === ComplainType.arrived ? ComplainType.arrived : ComplainType.not_arrive,
				marks: sameMoment.length,
				delay,
				atLeast,
				expected,
			},
		]
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
	const byTrip = groupByTrip(reports)
	const groups = new Map<string, MatchedReport[]>()
	reports
		.filter(r => r.stop === stop && r.direction === direction)
		.forEach(r => {
			const key = r.trip ? tripKey(r.trip) : `@${String(r.id)}`
			groups.set(key, [...(groups.get(key) ?? []), r])
		})

	return [...groups.entries()]
		.map(([key, list]): FeedItem => {
			const lastAt = Math.max(...list.map(r => r.at))
			const base = { key, scheduledTime: list[0].scheduledTime, lastAt }
			const arrived = list.filter(r => r.type === ComplainType.arrived)
			if (arrived.length > 0) return { ...base, status: `arrived`, at: Math.min(...arrived.map(r => r.at)) }

			const passedBy = list.find(r => r.type === ComplainType.passed_by)
			if (passedBy) return { ...base, status: `passedBy`, at: passedBy.at }

			// Old «earlier / later» rows have neither — show them as the bare time of the mark
			const notArrived = list.filter(r => r.type === ComplainType.not_arrive).sort((a, b) => b.at - a.at)[0] as
				| MatchedReport
				| undefined
			if (!notArrived?.trip) return { ...base, status: `notYet`, at: notArrived?.at ?? lastAt }

			const read = classifyNotArrived(
				notArrived,
				byTrip.get(key) ?? [],
				(byTrip.get(nextTripKey(notArrived.trip)) ?? []).filter(r => r.stop === stop),
			)
			if (read.kind === `passedBefore`) return { ...base, status: `passedBefore`, at: read.passedAt }
			if (read.kind === `cancelled`) return { ...base, status: `cancelled`, at: notArrived.at }

			return { ...base, status: `notYet`, at: notArrived.at }
		})
		.sort((a, b) => b.lastAt - a.lastAt)
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
