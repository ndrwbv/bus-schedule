import { distanceMeters } from 'shared/store/busStop/const/stops'
import { DirectionsNew, TaggedTime } from 'shared/store/busStop/Stops'

import { ComplainType } from '../model/Complains'
import { WaitState, WaitTrip } from '../model/waitState'
import { fromMinutes, toMinutes } from './matchReports'

/**
 * «Опрос на остановке» as a pure state machine (spec 15): `decideWaitCheck` says when to ask,
 * `applyWaitAnswer` what an answer means. `useWaitCheck` only glues them to React, storage and the
 * API — so every scenario can be played through in a script.
 */

/** Looking at a stop this long means waiting, not browsing */
export const WAITING_MS = 90 * 1000
/** Trips this close to now are the one a waiting passenger means */
export const TARGET_BEFORE = 15
export const TARGET_AFTER = 15
/** Ask this long after the bus should have come — enough for it to pull in */
export const ASK_AFTER = 2
/** «Ещё нет» → ask again in */
export const FOLLOW_UP = 4
export const MAX_ASKS = 6
/** Closer than this — at the stop; further than FAR — not waiting there, don't ask */
const AT_STOP_M = 150
const FAR_M = 500
/** Moved this far from where they stood — left the stop, most likely on the bus */
const LEFT_M = 200
/** GPS fixes worse than this can't tell «at the stop» from «across the street» */
export const MAX_ACCURACY_M = 100
/** Came back this long after we meant to ask — the moment is gone, don't ask about it any more */
const STALE = 30
/** After «Проехал мимо» or a long «ещё нет» — keep waiting for the next bus if it's this close */
const ROLLOVER_WITHIN = 60
/** The server takes «пришёл N мин назад» up to 30 min back */
const MAX_ARRIVED_AGO = 30
const ARRIVED_AGO_OPTIONS = [2, 5, 10, 15, 20, 25, 30]

export type Coords = [number, number]

/** What other passengers said about the bus we are asking about */
export type BusHint = { kind: 'here'; at: number } | { kind: 'downstream'; stop: string; at: number } | null

export type WaitStep =
	/** `overdue` — the scheduled time has passed: then «с какого времени вы ждёте» matters */
	| { kind: 'presence'; trip: TaggedTime; overdue: boolean }
	| { kind: 'bus'; left: boolean; hint: BusHint }
	| { kind: 'when' }
	| { kind: 'onTime'; trip: TaggedTime }
	| { kind: 'thanks'; text: string }
	/** News for the passenger, not a question — stays until they close it */
	| { kind: 'info'; title: string; text: string }

export interface WaitStop {
	id: string
	label: string
	direction: DirectionsNew
	/** «в город» / «из города» — only for stops served both ways, where it isn't obvious */
	directionText: string | null
}

export const toWaitTrip = (trip: TaggedTime): WaitTrip => ({
	time: trip.time,
	tripIndex: trip.tripIndex,
	dayKey: trip.dayKey,
	approx: !!trip.interpolated,
})

export const tripLabel = (trip: WaitTrip): string => (trip.approx ? `~${trip.time}` : trip.time)

/** When we mean to ask «пришёл?»: by the table, or by the delay passengers upstream reported */
const dueAt = (wait: WaitState, liveExpected: number | null): number =>
	liveExpected === null ? wait.askAt : Math.max(wait.askAt, liveExpected + ASK_AFTER)

export type WaitAction =
	| { kind: 'start' }
	| { kind: 'ask'; step: WaitStep }
	/** The bus they wait for came here before them (`seenAt`) — tell them, and wait for the next one */
	| { kind: 'rollover'; seenAt: number }
	| { kind: 'drop' }
	| null

export interface WaitCheckInput {
	now: number
	wait: WaitState | null
	coords: Coords | null
	/** When passengers upstream say the bus will be here, if it's late */
	liveExpected: number | null
	/** Other passengers' «Приехал» about the trip we wait for: at this stop / further along */
	seen: { hereAt: number | null; downstream: { stop: string; at: number } | null }
	stopLatLon: Coords | null
	target: TaggedTime | null
	/** The stop has been open long enough, on a phone, and they didn't say «Нет» here recently */
	mayAskPresence: boolean
}

const askBus = (left: boolean, hint: BusHint): WaitAction => ({ kind: `ask`, step: { kind: `bus`, left, hint } })

/** Someone is waiting: is it the moment to ask about the bus? */
const decideForWait = (wait: WaitState, { now, coords, liveExpected, seen }: WaitCheckInput): WaitAction => {
	const due = dueAt(wait, liveExpected)
	if (now - due > STALE) return { kind: `drop` }

	if (wait.where && coords && distanceMeters(wait.where, coords) > LEFT_M) return askBus(true, null)

	// Someone here saw it before this passenger came — they are really waiting for the next one
	if (seen.hereAt !== null && seen.hereAt < wait.presenceAt - 2) return { kind: `rollover`, seenAt: seen.hereAt }

	// Someone here or further along already saw it — ask now, it's the freshest moment. Unless this
	// passenger said «ещё нет» after that mark: then asking again every 10 s would be a loop
	const isNews = (at: number): boolean => wait.notYetAt === null || at > wait.notYetAt
	if (seen.hereAt !== null && isNews(seen.hereAt)) return askBus(false, { kind: `here`, at: seen.hereAt })
	if (seen.downstream && isNews(seen.downstream.at)) return askBus(false, { kind: `downstream`, ...seen.downstream })

	return now >= due ? askBus(false, null) : null
}

/** Nobody is waiting yet: is this passenger at the stop? */
const decideForPresence = ({ now, coords, stopLatLon, target, mayAskPresence }: WaitCheckInput): WaitAction => {
	if (!target || !stopLatLon || !mayAskPresence) return null

	if (coords) {
		const distance = distanceMeters(coords, stopLatLon)
		// We know they're here — no need to ask, just ask about the bus later
		if (distance <= AT_STOP_M) return { kind: `start` }
		// Far away: at home checking the time, not waiting — don't bother them
		if (distance > FAR_M) return null
	}

	return { kind: `ask`, step: { kind: `presence`, trip: target, overdue: now > toMinutes(target.time) } }
}

export const decideWaitCheck = (input: WaitCheckInput): WaitAction =>
	input.wait ? decideForWait(input.wait, input) : decideForPresence(input)

export type WaitAnswer =
	| { kind: 'presence'; answer: 'sinceScheduled' | 'justCame' | 'no' }
	| { kind: 'bus'; answer: 'arrived' | 'notYet' | 'passedBy' | 'gone' }
	| { kind: 'arrivedAt'; at: number }
	| { kind: 'left'; boarded: boolean }
	| { kind: 'onTime'; onTime: boolean }

export interface WaitMark {
	type: ComplainType
	trip: WaitTrip
	arrivedAt?: string
	wasOnTime?: boolean
}

export interface WaitOutcome {
	wait: WaitState | null
	marks: WaitMark[]
	step: WaitStep | null
	/** Don't ask about this trip at this stop again today */
	doneTrip?: string
	/** Don't ask «Вы на остановке?» here for a while — they said no, or they left on the bus */
	dismiss?: boolean
	/** They are at the stop — the moment to ask for the location, never earlier */
	requestLocation?: boolean
}

const newWait = (
	stop: WaitStop,
	trip: WaitTrip,
	presenceAt: number,
	now: number,
	day: string,
	where: Coords | null,
): WaitState => ({
	day,
	stopId: stop.id,
	stopLabel: stop.label,
	direction: stop.direction,
	directionText: stop.directionText,
	trip,
	presenceAt,
	onTime: presenceAt <= toMinutes(trip.time),
	askAt: Math.max(toMinutes(trip.time) + ASK_AFTER, now + 1),
	asks: 0,
	notYetAt: null,
	where,
})

const THANKS_ARRIVED = `Спасибо! Это подскажет тем, кто ждёт этот автобус дальше`

/** Still at the stop, the bus we asked about is gone one way or another — watch the next one */
const rollover = (wait: WaitState, next: WaitTrip | null, now: number, text: string): WaitOutcome => {
	if (!next || toMinutes(next.time) > now + ROLLOVER_WITHIN) {
		return { wait: null, marks: [], step: { kind: `thanks`, text }, doneTrip: wait.trip.time }
	}

	return {
		// Here before the next one is due — so its «ещё нет» will be a real delay
		wait: {
			...wait,
			trip: next,
			presenceAt: now,
			onTime: true,
			askAt: toMinutes(next.time) + ASK_AFTER,
			asks: 0,
			notYetAt: null,
		},
		marks: [],
		step: { kind: `thanks`, text: `${text}. Спросим про следующий, ${tripLabel(next)}` },
		doneTrip: wait.trip.time,
	}
}

interface AnswerInput {
	answer: WaitAnswer
	step: WaitStep
	wait: WaitState | null
	/** The stop on screen — where a new wait starts */
	stop: WaitStop | null
	/** The trip after the one we wait for, at the waiting stop */
	nextTrip: WaitTrip | null
	now: number
	day: string
	coords: Coords | null
}

const onPresence = (
	answer: 'sinceScheduled' | 'justCame' | 'no',
	{ step, stop, now, day, coords, wait }: AnswerInput,
): WaitOutcome => {
	if (step.kind !== `presence` || !stop) return { wait, marks: [], step: null }
	if (answer === `no`) return { wait, marks: [], step: null, dismiss: true }

	const trip = toWaitTrip(step.trip)
	// «Жду с 13:35» — here by the scheduled time, so a «ещё нет» later is a real delay
	const presenceAt = answer === `sinceScheduled` ? Math.min(now, toMinutes(trip.time)) : now
	const started = newWait(stop, trip, presenceAt, now, day, coords)

	return {
		wait: started,
		marks: [],
		step: {
			kind: `thanks`,
			text: `Хорошо! Около ${fromMinutes(started.askAt)} спросим, пришёл ли автобус ${tripLabel(trip)}`,
		},
		requestLocation: true,
	}
}

const onOnTime = (onTime: boolean, { step, stop, now, day, coords, wait }: AnswerInput): WaitOutcome => {
	if (step.kind !== `onTime` || !stop) return { wait, marks: [], step: null }
	const trip = toWaitTrip(step.trip)
	const presenceAt = onTime ? toMinutes(trip.time) : now
	// That tap was a «не приехал» too — the next question comes after it
	const started = {
		...newWait(stop, trip, presenceAt, now, day, coords),
		asks: 1,
		askAt: now + FOLLOW_UP,
		notYetAt: now,
	}

	return {
		wait: started,
		marks: [{ type: ComplainType.not_arrive, trip, wasOnTime: onTime }],
		step: { kind: `thanks`, text: `Спасибо! Около ${fromMinutes(started.askAt)} спросим, пришёл ли он` },
		requestLocation: true,
	}
}

/** The bus came: record it, and stop asking — they are on it now */
const arrived = (wait: WaitState, at: number): WaitOutcome => ({
	wait: null,
	marks: [{ type: ComplainType.arrived, trip: wait.trip, arrivedAt: fromMinutes(at) }],
	step: { kind: `thanks`, text: THANKS_ARRIVED },
	doneTrip: wait.trip.time,
	// On the bus now — «Вы на остановке?» in ten minutes would be silly
	dismiss: true,
})

const onBus = (
	answer: 'arrived' | 'notYet' | 'passedBy' | 'gone',
	wait: WaitState,
	{ nextTrip, now }: AnswerInput,
): WaitOutcome => {
	if (answer === `arrived`) return { wait, marks: [], step: { kind: `when` } }
	if (answer === `gone`) return { wait: null, marks: [], step: null, doneTrip: wait.trip.time, dismiss: true }
	if (answer === `passedBy`) {
		return {
			...rollover(wait, nextTrip, now, `Спасибо! Предупредим остальных`),
			marks: [{ type: ComplainType.passed_by, trip: wait.trip }],
		}
	}

	const marks = [{ type: ComplainType.not_arrive, trip: wait.trip, wasOnTime: wait.onTime }]
	if (wait.asks + 1 >= MAX_ASKS) {
		return { ...rollover(wait, nextTrip, now, `Спасибо! Это поможет понять, насколько он опаздывает`), marks }
	}
	const askAt = now + FOLLOW_UP

	return {
		wait: { ...wait, asks: wait.asks + 1, askAt, notYetAt: now },
		marks,
		step: { kind: `thanks`, text: `Спасибо! Спросим ещё раз около ${fromMinutes(askAt)}` },
	}
}

export const applyWaitAnswer = (input: AnswerInput): WaitOutcome => {
	const { answer, wait, now } = input

	if (answer.kind === `presence`) return onPresence(answer.answer, input)
	if (answer.kind === `onTime`) return onOnTime(answer.onTime, input)
	if (!wait) return { wait, marks: [], step: null }
	if (answer.kind === `arrivedAt`) return arrived(wait, answer.at)
	if (answer.kind === `bus`) return onBus(answer.answer, wait, input)

	// Left the stop: on the bus — it pulled away about a minute ago; or just walked off
	if (answer.boarded) return arrived(wait, now - 1)

	return { wait: null, marks: [], step: null, doneTrip: wait.trip.time, dismiss: true }
}

/**
 * «Когда он пришёл?» — only moments it could have come: after they started waiting and after the
 * last «ещё нет», and not beyond what the server accepts. Coming back after 20 min offers 20 min.
 */
export const arrivedAgoOptions = (wait: WaitState, now: number): number[] => {
	const fits = (ago: number): boolean =>
		ago <= MAX_ARRIVED_AGO && now - ago >= wait.presenceAt && (wait.notYetAt === null || now - ago > wait.notYetAt)

	// Spread over the whole window: back after 25 min, «2 мин назад» alone would be useless
	const all = ARRIVED_AGO_OPTIONS.filter(fits)

	return all.length <= 3 ? all : [all[0], all[Math.floor(all.length / 2)], all[all.length - 1]]
}
