import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { modalOpenSelector } from 'features/BottomSheet/model/bottomSheetSlice'
import { AndrewLytics } from 'shared/lib'
import {
	availableUserDirectionsSelector,
	busStopNewSelector,
	userDirectionSelector,
} from 'shared/store/busStop/busStopInfoSlice'
import { getScheduleTimes, userDirectionFromInternal } from 'shared/store/busStop/const/stops'
import { StopKeys, TaggedTime, UserDirection } from 'shared/store/busStop/Stops'
import { currentDaySelector, scheduleSelector } from 'shared/store/schedule/scheduleSlice'
import useEverySecondUpdater from 'shared/store/timeLeft/useEverySecondUpdater'

import { fromMinutes, nowMinutesInTomsk, stopOrder, toMinutes } from '../lib/matchReports'
import {
	applyWaitAnswer,
	Coords,
	decideWaitCheck,
	MAX_ACCURACY_M,
	TARGET_AFTER,
	TARGET_BEFORE,
	toWaitTrip,
	tripLabel,
	WaitAction,
	WaitAnswer,
	WAITING_MS,
	WaitOutcome,
	WaitStep,
	WaitStop,
} from '../lib/waitMachine'
import { ComplainType } from './Complains'
import { useComplainsContext } from './ComplainsContext'
import { useStopInsights, useTripMarks } from './useCrowdReports'
import {
	dismissStop,
	isDismissed,
	isTripDone,
	loadWait,
	markTripDone,
	saveWait,
	todayInTomsk,
	WaitState,
} from './waitState'

/**
 * «Опрос на остановке» (spec 15): React, storage and the API around the pure machine in
 * `lib/waitMachine.ts` — see there for when we ask and what the answers mean.
 */

const DIRECTION_TEXT: Record<UserDirection, string> = {
	[UserDirection.fromCity]: `из города`,
	[UserDirection.toCity]: `в город`,
}

/** People wait at a stop with a phone. A desktop tab left open at work is not waiting for a bus */
const isPhone = (): boolean => {
	try {
		return window.matchMedia(`(pointer: coarse)`).matches
	} catch {
		return false
	}
}

/** Location only when the passenger allowed it — we never ask for it out of the blue */
const useLocation = (active: boolean): { coords: Coords | null; request: () => void } => {
	const [granted, setGranted] = useState(false)
	const [requested, setRequested] = useState(false)
	const [coords, setCoords] = useState<Coords | null>(null)

	useEffect(() => {
		// Safari before 16 has no Permissions API — then we only watch after an explicit «Да, жду»
		if (!(`permissions` in navigator)) return
		navigator.permissions
			.query({ name: `geolocation` })
			.then(status => {
				setGranted(status.state === `granted`)
				status.onchange = (): void => setGranted(status.state === `granted`)

				return null
			})
			.catch(() => null)
	}, [])

	useEffect(() => {
		if (!active || !(granted || requested) || !(`geolocation` in navigator)) return undefined

		const id = navigator.geolocation.watchPosition(
			p => {
				if (p.coords.accuracy <= MAX_ACCURACY_M) setCoords([p.coords.latitude, p.coords.longitude])
			},
			() => null,
			{ enableHighAccuracy: true, maximumAge: 30_000 },
		)

		return () => navigator.geolocation.clearWatch(id)
	}, [active, granted, requested])

	return { coords, request: useCallback(() => setRequested(true), []) }
}

export type { WaitStep }

export interface WaitCheck {
	step: WaitStep | null
	wait: WaitState | null
	/** The stop on screen — the one «Вы на остановке?» is about */
	stop: WaitStop | null
	now: number
	answer: (answer: WaitAnswer) => void
	/** Inline «Не приехал»: ask «Вы были здесь к 12:55?» */
	askOnTime: (trip: TaggedTime) => void
	close: () => void
}

export const useWaitCheck = (): WaitCheck => {
	const busStop = useSelector(busStopNewSelector)
	const userDirection = useSelector(userDirectionSelector)
	const availableDirections = useSelector(availableUserDirectionsSelector)
	const schedule = useSelector(scheduleSelector)
	const dayKey = useSelector(currentDaySelector)
	const otherModalOpen = useSelector(modalOpenSelector)
	const insights = useStopInsights()
	const marksFor = useTripMarks()
	const { addComplain } = useComplainsContext()
	const tick = useEverySecondUpdater()

	const [wait, setWaitState] = useState<WaitState | null>(loadWait)
	const [step, setStep] = useState<WaitStep | null>(null)
	const openedAt = useRef(Date.now())

	const setWait = useCallback((next: WaitState | null) => {
		saveWait(next)
		setWaitState(next)
	}, [])

	const stop = useMemo(
		(): WaitStop | null =>
			busStop && {
				id: busStop.id,
				label: busStop.label,
				direction: busStop.direction,
				directionText:
					availableDirections.length > 1
						? DIRECTION_TEXT[userDirectionFromInternal(busStop.direction)]
						: null,
			},
		[availableDirections.length, busStop],
	)

	useEffect(() => {
		openedAt.current = Date.now()
	}, [stop?.id])

	// The trip a passenger waiting here right now means: due soon or just overdue, not seen here yet
	const target = useMemo((): TaggedTime | null => {
		if (!stop) return null
		const now = nowMinutesInTomsk()

		return (
			getScheduleTimes(schedule, userDirection, dayKey, stop.label).find(t => {
				const scheduled = toMinutes(t.time)

				return (
					t.direction === stop.direction &&
					scheduled >= now - TARGET_BEFORE &&
					scheduled <= now + TARGET_AFTER &&
					!marksFor(t, stop.label)?.arrivedHere &&
					!isTripDone(stop.id, t.time)
				)
			}) ?? null
		)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [stop, schedule, userDirection, dayKey, marksFor, tick])

	// The bus after the one we wait for, at the waiting stop — to keep waiting after «Проехал мимо»
	const nextTrip = useMemo(() => {
		if (!wait) return null
		const after = toMinutes(wait.trip.time)
		const next = getScheduleTimes(schedule, userDirectionFromInternal(wait.direction), dayKey, wait.stopLabel).find(
			t => t.direction === wait.direction && toMinutes(t.time) > after,
		)

		return next ? toWaitTrip(next) : null
	}, [dayKey, schedule, wait])

	// Other passengers' «Приехал» about our trip: at the waiting stop, and further along the route
	const seen = useMemo(() => {
		if (!wait) return { hereAt: null, downstream: null }
		const ref = { direction: wait.direction, dayKey: wait.trip.dayKey, tripIndex: wait.trip.tripIndex }
		const arrived = (marksFor(ref)?.all ?? []).filter(m => m.type === ComplainType.arrived)
		const order = stopOrder(schedule, ref)
		const myPos = order.get(wait.stopLabel) ?? Infinity
		const here = arrived.filter(m => m.stop === wait.stopLabel)
		const further = arrived.filter(m => (order.get(m.stop) ?? -1) > myPos).sort((a, b) => a.at - b.at)[0] as
			| (typeof arrived)[number]
			| undefined

		return {
			hereAt: here.length > 0 ? Math.min(...here.map(m => m.at)) : null,
			downstream: further ? { stop: further.stop, at: further.at } : null,
		}
	}, [marksFor, schedule, wait])

	const { coords, request: requestLocation } = useLocation(!!wait || !!target)

	// Remember where they stand once the location comes in
	useEffect(() => {
		if (wait && !wait.where && coords) setWait({ ...wait, where: coords })
	}, [coords, setWait, wait])

	const apply = useCallback(
		(out: WaitOutcome, of: WaitState | null) => {
			out.marks.forEach(mark => {
				const at = out.wait ?? of
				if (!at) return
				void addComplain({
					stop: at.stopLabel as StopKeys,
					direction: at.direction,
					date: new Date().toISOString(),
					type: mark.type,
					trip: { scheduledTime: mark.trip.time, tripIndex: mark.trip.tripIndex, dayKey: mark.trip.dayKey },
					arrivedAt: mark.arrivedAt,
					wasOnTime: mark.wasOnTime,
				})
			})
			const stopId = (out.wait ?? of)?.stopId ?? stop?.id
			if (out.doneTrip && stopId) markTripDone(stopId, out.doneTrip)
			if (out.dismiss && stopId) dismissStop(stopId)
			if (out.requestLocation) requestLocation()
			setWait(out.wait)
			setStep(out.step)
		},
		[addComplain, requestLocation, setWait, stop?.id],
	)

	const outcomeOf = (a: WaitAnswer, of: WaitStep, now: number): WaitOutcome =>
		applyWaitAnswer({ answer: a, step: of, wait, stop, nextTrip, now, day: todayInTomsk(), coords })

	const run = (action: WaitAction, now: number): void => {
		if (!action) return
		AndrewLytics([`wait`, action.kind, action.kind === `ask` ? action.step.kind : ``].join(`:`))

		if (action.kind === `drop`) setWait(null)
		if (action.kind === `ask`) setStep(action.step)
		if (action.kind === `start` && target) {
			// Silently: we know where they are, nothing to ask or thank them for yet
			const out = outcomeOf(
				{ kind: `presence`, answer: `justCame` },
				{ kind: `presence`, trip: target, overdue: false },
				now,
			)
			apply({ ...out, step: null }, null)
		}
		if (action.kind === `rollover` && wait) {
			// Not a «проехал мимо» — the bus came before them. They are waiting for a bus that is gone:
			// that is the one thing they need to know
			const out = outcomeOf({ kind: `bus`, answer: `passedBy` }, { kind: `bus`, left: false, hint: null }, now)
			const next = out.wait
				? `Следующий — ${tripLabel(out.wait.trip)}, спросим про него.`
				: `Сегодня больше рейсов скоро нет.`
			apply(
				{
					...out,
					marks: [],
					step: {
						kind: `info`,
						title: `Автобус ${tripLabel(wait.trip)} уже прошёл`,
						text: `Здесь его отметили в ${fromMinutes(action.seenAt)}, раньше, чем вы подошли. ${next}`,
					},
				},
				wait,
			)
		}
	}

	// The decision, re-made every 10 s: is it the moment to ask something?
	useEffect(() => {
		if (step || otherModalOpen || document.visibilityState !== `visible`) return
		const now = nowMinutesInTomsk()
		const live =
			wait && wait.stopId === stop?.id ? insights?.live.find(l => l.trip.time === wait.trip.time) : undefined

		run(
			decideWaitCheck({
				now,
				wait,
				coords,
				liveExpected: live && live.delay > 0 ? live.expected : null,
				seen,
				stopLatLon: busStop?.latLon ?? null,
				target,
				mayAskPresence:
					!!stop && isPhone() && !isDismissed(stop.id) && Date.now() - openedAt.current >= WAITING_MS,
			}),
			now,
		)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [tick, step, otherModalOpen, wait, target, coords, seen])

	const answer = (a: WaitAnswer): void => {
		if (!step) return
		AndrewLytics([`wait:answer`, a.kind, `answer` in a ? a.answer : ``].join(`:`))
		apply(outcomeOf(a, step, nowMinutesInTomsk()), wait)
	}

	const askOnTime = (trip: TaggedTime): void => setStep({ kind: `onTime`, trip })

	const close = (): void => {
		if (!step) return
		// ✕ on «Вы на остановке?» = «нет»; on a question about the bus = «не спрашивайте про этот рейс»
		if (step.kind === `presence`) answer({ kind: `presence`, answer: `no` })
		else if (step.kind === `bus` || step.kind === `when`) answer({ kind: `bus`, answer: `gone` })
		else setStep(null)
	}

	return { step, wait, stop, now: nowMinutesInTomsk(), answer, askOnTime, close }
}
