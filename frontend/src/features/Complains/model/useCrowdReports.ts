import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { busStopNewSelector } from 'shared/store/busStop/busStopInfoSlice'
import { TripRef } from 'shared/store/busStop/const/stops'
import { TaggedTime } from 'shared/store/busStop/Stops'
import { currentDaySelector, scheduleSelector } from 'shared/store/schedule/scheduleSlice'
import { closestTimeArraySelector } from 'shared/store/timeLeft/timeLeftSlice'
import useEverySecondUpdater from 'shared/store/timeLeft/useEverySecondUpdater'

import { MatchedReport, matchReport, nowMinutesInTomsk, tripKey } from '../lib/matchReports'
import { buildStopInsights, StopInsights } from '../lib/stopInsights'
import { ComplainType } from './Complains'
import { useComplainsContext } from './ComplainsContext'

/** Today's marks, each tied to the trip it is about */
export const useMatchedReports = (): MatchedReport[] => {
	const { complains } = useComplainsContext()
	const schedule = useSelector(scheduleSelector)
	const dayKey = useSelector(currentDaySelector)

	return useMemo(() => complains.map(c => matchReport(c, schedule, dayKey)), [complains, schedule, dayKey])
}

/** What passengers say about the selected stop: live signals, «обычно», today's feed */
export const useStopInsights = (): StopInsights | null => {
	const reports = useMatchedReports()
	const { delays } = useComplainsContext()
	const schedule = useSelector(scheduleSelector)
	const dayKey = useSelector(currentDaySelector)
	const stop = useSelector(busStopNewSelector)
	const nextTrip = useSelector(closestTimeArraySelector)[0] as TaggedTime | undefined
	const tick = useEverySecondUpdater()

	return useMemo(() => {
		if (!stop) return null

		return buildStopInsights({
			reports,
			stats: delays,
			schedule,
			dayKey,
			stop: stop.label,
			direction: stop.direction,
			now: nowMinutesInTomsk(),
			nextTripTime: nextTrip?.time ?? null,
		})
		// `tick` re-evaluates «now» every 10 s
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [reports, delays, schedule, dayKey, stop, nextTrip, tick])
}

export interface TripMarks {
	arrivedHere: MatchedReport | null
	/** Latest «Не приехал» here — shown as a fact, «в 12:25 не было» */
	notArrivedHere: MatchedReport | null
	/** Freshest «Приехал» anywhere on the trip */
	lastArrived: MatchedReport | null
	all: MatchedReport[]
}

/** Marks grouped by trip — for the badges in the list of today's buses and in the trip modal */
export const useTripMarks = (): ((trip: TripRef, stop?: string) => TripMarks | null) => {
	const reports = useMatchedReports()

	return useMemo(() => {
		const byTrip = new Map<string, MatchedReport[]>()
		reports.forEach(r => {
			if (!r.trip) return
			const key = tripKey(r.trip)
			byTrip.set(key, [...(byTrip.get(key) ?? []), r])
		})

		return (trip: TripRef, stop?: string): TripMarks | null => {
			const all = byTrip.get(tripKey(trip))
			if (!all) return null

			const arrived = all.filter(r => r.type === ComplainType.arrived)

			return {
				arrivedHere: (stop && arrived.find(r => r.stop === stop)) || null,
				notArrivedHere:
					(stop &&
						all
							.filter(r => r.stop === stop && r.type === ComplainType.not_arrive)
							.reduce<MatchedReport | null>((a, b) => (!a || b.at > a.at ? b : a), null)) ||
					null,
				lastArrived: arrived.reduce<MatchedReport | null>((a, b) => (!a || b.at > a.at ? b : a), null),
				all,
			}
		}
	}, [reports])
}
