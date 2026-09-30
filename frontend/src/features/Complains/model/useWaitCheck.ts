import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { modalOpenSelector } from 'features/BottomSheet/model/bottomSheetSlice'
import { AndrewLytics } from 'shared/lib'
import { busStopNewSelector, userDirectionSelector } from 'shared/store/busStop/busStopInfoSlice'
import { getScheduleTimes } from 'shared/store/busStop/const/stops'
import { StopKeys, TaggedTime } from 'shared/store/busStop/Stops'
import { currentDaySelector, scheduleSelector } from 'shared/store/schedule/scheduleSlice'
import useEverySecondUpdater from 'shared/store/timeLeft/useEverySecondUpdater'

import {
	ASK_AFTER,
	Coords,
	decideWaitCheck,
	FOLLOW_UP,
	MAX_ACCURACY_M,
	MAX_ASKS,
	TARGET_AFTER,
	TARGET_BEFORE,
	WAITING_MS,
	WaitStep,
} from '../lib/decideWaitCheck'
import { fromMinutes, nowMinutesInTomsk, toMinutes } from '../lib/matchReports'
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
 * «Опрос на остановке» (spec 15). Instead of hoping people press a button at the right moment,
 * notice that someone is waiting and ask them — once they are at the stop, and when the bus should
 * be there:
 *
 * 1. The stop has been open for a while and a bus is due → «Вы на остановке?» (skipped when the
 *    location says so; not asked at all when it says they are far away).
 * 2. When the bus should be there — by the timetable, or later if passengers upstream said it is
 *    late — «Автобус 12:55 пришёл?». «Ещё нет» → ask again in a few minutes.
 * 3. If the location shows they left the stop, they most likely got on the bus → «Вы сели в него?»
 */

/** Location only when the passenger allowed it — we never ask for it out of the blue */
const useLocation = (active: boolean): { coords: Coords | null; request: () => void } => {
	const [granted, setGranted] = useState(false)
	const [requested, setRequested] = useState(false)
	const [coords, setCoords] = useState<Coords | null>(null)

	useEffect(() => {
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (!active || !(granted || requested) || !navigator.geolocation) return undefined

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
	stopLabel: string | null
	/** Inline «Не приехал»: ask «Вы были здесь к 12:55?» */
	askOnTime: (trip: TaggedTime) => void
	confirmPresence: (atStop: boolean) => void
	answerBus: (answer: 'arrived' | 'notYet' | 'passedBy' | 'gone') => void
	answerLeft: (boarded: boolean) => void
	answerWhen: (minutesAgo: number) => void
	answerOnTime: (onTime: boolean) => void
	close: () => void
}

export const useWaitCheck = (): WaitCheck => {
	const stop = useSelector(busStopNewSelector)
	const userDirection = useSelector(userDirectionSelector)
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

	const { coords, request: requestLocation } = useLocation(!!wait || !!target)

	const startWait = useCallback(
		(trip: TaggedTime, presenceAt: number, askAt: number, asks = 0): WaitState | null => {
			if (!stop) return null
			const next: WaitState = {
				day: todayInTomsk(),
				stopId: stop.id,
				stopLabel: stop.label,
				direction: stop.direction,
				trip: { time: trip.time, tripIndex: trip.tripIndex, dayKey: trip.dayKey },
				presenceAt,
				onTime: presenceAt <= toMinutes(trip.time),
				askAt,
				asks,
				notYetAt: null,
				where: coords,
			}
			setWait(next)

			return next
		},
		[coords, setWait, stop],
	)

	const finish = useCallback(
		(text: string | null) => {
			if (wait) markTripDone(wait.stopId, wait.trip.time)
			setWait(null)
			setStep(text ? { kind: `thanks`, text } : null)
		},
		[setWait, wait],
	)

	const submit = useCallback(
		(of: WaitState, type: ComplainType, extra: { arrivedAt?: string; wasOnTime?: boolean } = {}) => {
			void addComplain({
				stop: of.stopLabel as StopKeys,
				direction: of.direction,
				date: new Date().toISOString(),
				type,
				trip: { scheduledTime: of.trip.time, tripIndex: of.trip.tripIndex, dayKey: of.trip.dayKey },
				...extra,
			})
		},
		[addComplain],
	)

	// Remember where they stand once the location comes in
	useEffect(() => {
		if (wait && !wait.where && coords) setWait({ ...wait, where: coords })
	}, [coords, setWait, wait])

	// The decision, re-made every 10 s: is it the moment to ask something?
	useEffect(() => {
		if (step || otherModalOpen || document.visibilityState !== `visible`) return
		const now = nowMinutesInTomsk()
		const live =
			wait && wait.stopId === stop?.id ? insights?.live.find(l => l.trip.time === wait.trip.time) : undefined

		const action = decideWaitCheck({
			now,
			wait,
			coords,
			liveExpected: live && live.delay > 0 ? live.expected : null,
			stopLatLon: stop?.latLon ?? null,
			target,
			mayAskPresence: !!stop && !isDismissed(stop.id) && Date.now() - openedAt.current >= WAITING_MS,
		})

		if (action?.kind === `start` && target) startWait(target, now, toMinutes(target.time) + ASK_AFTER)
		if (action?.kind === `ask`) {
			setStep(action.step)
			const isLeft = action.step.kind === `bus` && action.step.left
			AndrewLytics(isLeft ? `wait:left` : [`wait`, action.step.kind].join(`:`))
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [tick, step, otherModalOpen, wait, target, coords])

	const confirmPresence = (atStop: boolean): void => {
		if (step?.kind !== `presence` || !stop) return
		AndrewLytics(atStop ? `wait:presence:yes` : `wait:presence:no`)

		if (!atStop) {
			dismissStop(stop.id)
			setStep(null)

			return
		}

		startWait(step.trip, nowMinutesInTomsk(), toMinutes(step.trip.time) + ASK_AFTER)
		// Watching the location lets us skip «Вы на остановке?» and notice them boarding. The browser
		// asks for permission right here, after a «Да» — never on page load
		requestLocation()
		setStep({ kind: `thanks`, text: `Хорошо! Когда подойдёт время, спросим, пришёл ли автобус ${step.trip.time}` })
	}

	const answerBus = (answer: 'arrived' | 'notYet' | 'passedBy' | 'gone'): void => {
		if (!wait) return
		AndrewLytics(`wait:bus:${answer}`)

		if (answer === `arrived`) {
			setStep({ kind: `when` })

			return
		}
		if (answer === `passedBy`) {
			submit(wait, ComplainType.passed_by)
			finish(`Спасибо! Предупредим остальных`)

			return
		}
		if (answer === `gone`) {
			finish(null)

			return
		}

		submit(wait, ComplainType.not_arrive, { wasOnTime: wait.onTime })
		if (wait.asks + 1 >= MAX_ASKS) {
			finish(`Спасибо! Это поможет понять, насколько он опаздывает`)

			return
		}
		const now = nowMinutesInTomsk()
		setWait({ ...wait, asks: wait.asks + 1, askAt: now + FOLLOW_UP, notYetAt: now })
		setStep({ kind: `thanks`, text: `Спасибо! Спросим ещё раз через ${FOLLOW_UP} минуты` })
	}

	const answerLeft = (boarded: boolean): void => {
		if (!wait) return
		AndrewLytics(boarded ? `wait:left:boarded` : `wait:left:walked`)
		// Left a minute ago or so — about when the bus pulled away
		if (boarded) submit(wait, ComplainType.arrived, { arrivedAt: fromMinutes(nowMinutesInTomsk() - 1) })
		finish(boarded ? `Спасибо! Это подскажет тем, кто ждёт этот автобус дальше` : null)
	}

	const answerWhen = (minutesAgo: number): void => {
		if (!wait) return
		AndrewLytics(`wait:when:${minutesAgo}`)
		submit(wait, ComplainType.arrived, { arrivedAt: fromMinutes(nowMinutesInTomsk() - minutesAgo) })
		finish(`Спасибо! Это подскажет тем, кто ждёт этот автобус дальше`)
	}

	const askOnTime = (trip: TaggedTime): void => setStep({ kind: `onTime`, trip })

	const answerOnTime = (onTime: boolean): void => {
		if (step?.kind !== `onTime`) return
		AndrewLytics(onTime ? `wait:ontime:yes` : `wait:ontime:no`)
		const now = nowMinutesInTomsk()
		const started = startWait(step.trip, onTime ? toMinutes(step.trip.time) : now, now + FOLLOW_UP, 1)
		if (started) {
			// That was a «не приехал» too — the bus comes after it
			setWait({ ...started, notYetAt: now })
			submit(started, ComplainType.not_arrive, { wasOnTime: onTime })
		}
		requestLocation()
		setStep({ kind: `thanks`, text: `Спасибо! Спросим через ${FOLLOW_UP} минуты, пришёл ли он` })
	}

	const close = (): void => {
		if (step?.kind === `presence` && stop) dismissStop(stop.id)
		// Closing a question about the bus = «не спрашивайте больше про этот рейс»
		if (step?.kind === `bus` || step?.kind === `when`) finish(null)
		else setStep(null)
	}

	return {
		step,
		wait,
		stopLabel: stop?.label ?? null,
		askOnTime,
		confirmPresence,
		answerBus,
		answerLeft,
		answerWhen,
		answerOnTime,
		close,
	}
}
