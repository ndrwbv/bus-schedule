import { distanceMeters } from 'shared/store/busStop/const/stops'
import { TaggedTime } from 'shared/store/busStop/Stops'

import { WaitState } from '../model/waitState'

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

export type WaitStep =
	| { kind: 'presence'; trip: TaggedTime }
	| { kind: 'bus'; left: boolean }
	| { kind: 'when' }
	| { kind: 'onTime'; trip: TaggedTime }
	| { kind: 'thanks'; text: string }

export type Coords = [number, number]

/** What to do right now: nothing, start a wait silently (we know they're at the stop), or ask */
type WaitAction = { kind: 'start' } | { kind: 'ask'; step: WaitStep } | null

export const decideWaitCheck = ({
	now,
	wait,
	coords,
	liveExpected,
	stopLatLon,
	target,
	mayAskPresence,
}: {
	now: number
	wait: WaitState | null
	coords: Coords | null
	/** When passengers upstream say the bus will be here, if it's late */
	liveExpected: number | null
	stopLatLon: Coords | null
	target: TaggedTime | null
	/** The stop has been open long enough, and they didn't say «Нет» here recently */
	mayAskPresence: boolean
}): WaitAction => {
	if (wait) {
		if (wait.where && coords && distanceMeters(wait.where, coords) > LEFT_M) {
			return { kind: `ask`, step: { kind: `bus`, left: true } }
		}

		// Late by the marks upstream — ask when it should really be here, not by the table
		const askAt = liveExpected === null ? wait.askAt : Math.max(wait.askAt, liveExpected + ASK_AFTER)

		return now >= askAt ? { kind: `ask`, step: { kind: `bus`, left: false } } : null
	}

	if (!target || !stopLatLon || !mayAskPresence) return null

	if (coords) {
		const distance = distanceMeters(coords, stopLatLon)
		// We know they're here — no need to ask, just ask about the bus later
		if (distance <= AT_STOP_M) return { kind: `start` }
		// Far away: at home checking the time, not waiting — don't bother them
		if (distance > FAR_M) return null
	}

	return { kind: `ask`, step: { kind: `presence`, trip: target } }
}
