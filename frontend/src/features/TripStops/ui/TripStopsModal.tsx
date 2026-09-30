import { useEffect, useMemo, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AndrewLytics } from 'shared/lib'
import { busStopNewSelector, setBusStopNew } from 'shared/store/busStop/busStopInfoSlice'
import { findLinkedLeg, getTrip, TripRef, userDirectionFromInternal } from 'shared/store/busStop/const/stops'
import { UserDirection } from 'shared/store/busStop/Stops'
import { currentDaySelector, scheduleSelector } from 'shared/store/schedule/scheduleSlice'
import { Modal } from 'shared/ui/Modal'

import { nowMinutesInTomsk, timeToMinutes } from '../lib/nowInTomsk'
import { closeTrip, openedTripSelector, openTrip } from '../model/tripStopsSlice'
import { DirectionChip, USER_DIRECTION_SHORT } from './DirectionChip'
import styles from './tripStops.module.css'

const LINE_COLORS: Record<UserDirection, string> = {
	[UserDirection.toCity]: `#336cff`,
	[UserDirection.fromCity]: `#f07314`,
}

const cx = (...names: (string | false)[]): string => names.filter(Boolean).join(` `)

const rowClassName = (isMine: boolean, isPassed: boolean): string =>
	cx(styles.row, isMine && styles.rowMine, isPassed && styles.rowPassed)

/** What to show next to a stop in the trip — the page plugs crowd marks in here */
export type RenderStopExtra = (trip: TripRef, stopLabel: string) => React.ReactNode

const TripStops: React.FC<{ trip: TripRef; renderStopExtra?: RenderStopExtra }> = ({ trip, renderStopExtra }) => {
	const dispatch = useDispatch()
	const schedule = useSelector(scheduleSelector)
	const currentDayKey = useSelector(currentDaySelector)
	const myStop = useSelector(busStopNewSelector)
	const mineRef = useRef<HTMLButtonElement>(null)

	const stops = useMemo(
		() => getTrip(schedule, trip.direction, trip.dayKey, trip.tripIndex),
		[schedule, trip.dayKey, trip.direction, trip.tripIndex],
	)
	const nextLeg = useMemo(() => findLinkedLeg(schedule, trip, `next`), [schedule, trip])
	const prevLeg = useMemo(() => findLinkedLeg(schedule, trip, `prev`), [schedule, trip])

	const userDirection = userDirectionFromInternal(trip.direction)
	const isToday = trip.dayKey === currentDayKey
	const now = nowMinutesInTomsk()
	const hasInterpolated = stops.some(s => s.interpolated)

	useEffect(() => {
		mineRef.current?.scrollIntoView({ block: `center` })
	}, [trip])

	if (stops.length === 0) return <p className={styles.legend}>Для этого рейса нет данных</p>

	const first = stops[0]
	const last = stops[stops.length - 1]

	const handleStopClick = (id: string): void => {
		dispatch(setBusStopNew(id))
		dispatch(closeTrip())
		AndrewLytics(`trip:stopclick`)
	}

	const renderLinked = (leg: TripRef | null, kind: 'next' | 'prev'): JSX.Element | null => {
		if (!leg) return null

		const legStops = getTrip(schedule, leg.direction, leg.dayKey, leg.tripIndex)
		if (legStops.length === 0) return null

		const legDirection = USER_DIRECTION_SHORT[userDirectionFromInternal(leg.direction)]
		const title =
			kind === `next` ? `Дальше этот автобус едет ${legDirection}` : `До этого автобус ехал ${legDirection}`
		const hint =
			kind === `next`
				? `${legStops[0].stop.label}, ${legStops[0].time}`
				: `${legStops[0].stop.label}, ${legStops[0].time} → ${legStops[legStops.length - 1].time}`

		return (
			<button
				className={styles.linked}
				type="button"
				onClick={(): void => {
					dispatch(openTrip(leg))
					AndrewLytics(`trip:linked`)
				}}
			>
				<span>
					{title}
					<span className={styles.linkedHint}>{hint}</span>
				</span>
				<span aria-hidden>→</span>
			</button>
		)
	}

	return (
		<div style={{ '--trip-line': LINE_COLORS[userDirection] } as React.CSSProperties}>
			<div className={styles.summary}>
				<DirectionChip direction={userDirection} />
				<span className={styles.route}>
					{first.stop.label} → {last.stop.label}
				</span>
			</div>

			{renderLinked(prevLeg, `prev`)}

			<ol className={styles.list} style={prevLeg ? { marginTop: 12 } : undefined}>
				{stops.map(({ stop, time, interpolated }) => {
					const isMine = myStop?.id === stop.id
					const isPassed = isToday && timeToMinutes(time) < now

					return (
						<li key={stop.id}>
							<button
								ref={isMine ? mineRef : undefined}
								className={rowClassName(isMine, isPassed)}
								type="button"
								onClick={(): void => handleStopClick(stop.id)}
							>
								<span className={cx(styles.time, interpolated && styles.timeApprox)}>
									{interpolated ? `~` : ``}
									{time}
								</span>
								<span className={cx(styles.dot, !interpolated && styles.dotPrinted)} />
								<span className={styles.name}>{stop.label}</span>
								{renderStopExtra?.(trip, stop.label)}
								{isMine && <span className={styles.badge}>ваша</span>}
							</button>
						</li>
					)
				})}
			</ol>

			{hasInterpolated && (
				<p className={styles.legend}>
					~ — примерное время: перевозчик его не печатает, оно посчитано по соседним остановкам
				</p>
			)}

			{renderLinked(nextLeg, `next`)}
		</div>
	)
}

/** Every stop of the tapped trip with its time. Mounted once on the page, opened via `openTrip()` */
export const TripStopsModal: React.FC<{ renderStopExtra?: RenderStopExtra }> = ({ renderStopExtra }) => {
	const dispatch = useDispatch()
	const trip = useSelector(openedTripSelector)
	const schedule = useSelector(scheduleSelector)

	if (!trip) return null

	const handleClose = (): void => {
		dispatch(closeTrip())
	}
	const stops = getTrip(schedule, trip.direction, trip.dayKey, trip.tripIndex)
	const title = stops.length > 0 ? `Рейс в ${stops[0].time}` : `Рейс`

	return (
		<Modal title={title} onClose={handleClose}>
			<TripStops trip={trip} renderStopExtra={renderStopExtra} />
		</Modal>
	)
}
