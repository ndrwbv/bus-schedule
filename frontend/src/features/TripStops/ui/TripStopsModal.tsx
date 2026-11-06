import { useEffect, useMemo, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AndrewLytics } from 'shared/lib'
import { busStopNewSelector, setBusStopNew } from 'shared/store/busStop/busStopInfoSlice'
import { findLinkedLeg, getTrip, TripRef, userDirectionFromInternal } from 'shared/store/busStop/const/stops'
import { currentDaySelector, scheduleSelector } from 'shared/store/schedule/scheduleSlice'
import { tomskDate } from 'shared/store/schedule/serviceDate'
import { Modal } from 'shared/ui/Modal'

import { nowMinutesInTomsk, timeToMinutes } from '../lib/nowInTomsk'
import { closeTrip, openedTripSelector, openTrip } from '../model/tripStopsSlice'
import { DirectionChip, USER_DIRECTION_SHORT } from './DirectionChip'
import styles from './tripStops.module.css'

const cx = (...names: (string | false)[]): string => names.filter(Boolean).join(` `)

const rowClassName = (isMine: boolean, isPassed: boolean): string =>
	cx(styles.row, isMine && styles.rowMine, isPassed && styles.rowPassed)

const TripStops: React.FC<{ trip: TripRef }> = ({ trip }) => {
	const dispatch = useDispatch()
	const schedule = useSelector(scheduleSelector)
	const currentDayKey = useSelector(currentDaySelector)
	const myStop = useSelector(busStopNewSelector)
	const mineRef = useRef<HTMLButtonElement>(null)

	const stops = useMemo(
		() => getTrip(schedule, trip.direction, trip.dayKey, trip.tripIndex, trip.tripId),
		[schedule, trip.dayKey, trip.direction, trip.tripIndex, trip.tripId],
	)
	const nextLeg = useMemo(() => findLinkedLeg(schedule, trip, `next`), [schedule, trip])
	const nextDeparture = nextLeg
		? getTrip(schedule, nextLeg.direction, nextLeg.dayKey, nextLeg.tripIndex, nextLeg.tripId)[0]
		: null

	const userDirection = userDirectionFromInternal(trip.direction)
	const isToday = trip.serviceDate ? trip.serviceDate === tomskDate() : trip.dayKey === currentDayKey
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

	return (
		<>
			<div className={styles.summary}>
				<DirectionChip direction={userDirection} />
				<span className={styles.route}>
					{first.stop.label} — {last.stop.label}
				</span>
			</div>

			<ol className={styles.list}>
				{stops.map(({ stop, time, interpolated }, visitIndex) => {
					const isMine =
						trip.visitIndex === undefined ? myStop?.label === stop.label : visitIndex === trip.visitIndex
					const isPassed = isToday && timeToMinutes(time) < now

					return (
						<li key={`${stop.id}-${time}`}>
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

			{nextLeg && nextDeparture && (
				<button
					className={styles.linked}
					type="button"
					onClick={(): void => {
						dispatch(openTrip(nextLeg))
						AndrewLytics(`trip:linked`)
					}}
				>
					<span>
						Дальше этот автобус едет {USER_DIRECTION_SHORT[userDirectionFromInternal(nextLeg.direction)]}
						<span className={styles.linkedHint}>
							{nextDeparture.stop.label}, {nextDeparture.time}
						</span>
					</span>
					<span aria-hidden>→</span>
				</button>
			)}
		</>
	)
}

/** Every stop of the tapped trip with its time. Mounted once on the page, opened via `openTrip()` */
export const TripStopsModal: React.FC = () => {
	const dispatch = useDispatch()
	const trip = useSelector(openedTripSelector)
	const schedule = useSelector(scheduleSelector)

	if (!trip) return null

	const handleClose = (): void => {
		dispatch(closeTrip())
	}
	const stops = getTrip(schedule, trip.direction, trip.dayKey, trip.tripIndex, trip.tripId)
	const formattedDate = trip.serviceDate?.split(`-`).reverse().join(`.`)
	const dayLabel = trip.serviceDate && trip.serviceDate !== tomskDate() ? ` · ${formattedDate}` : ``
	const title = stops.length > 0 ? `Рейс в ${stops[0].time}${dayLabel}` : `Рейс`

	return (
		<Modal title={title} onClose={handleClose}>
			<TripStops trip={trip} />
		</Modal>
	)
}
