import { TripRef } from 'shared/store/busStop/const/stops'

import { fromMinutes } from '../lib/matchReports'
import { useTripMarks } from '../model/useCrowdReports'
import { formatDelay } from './StopCrowdStatus'
import styles from './tripMarkBadge.module.css'

const delayClass = (delay: number): string => (delay > 1 ? styles.late : styles.good)

/**
 * A trip's crowd status at one stop: «✓ 11:34 +4» when it was marked here, «~+6 мин» when it was
 * marked somewhere else along the route today (`onlyHere` hides that — used in the trip modal,
 * where every stop gets its own badge).
 */
export const TripMarkBadge: React.FC<{ trip: TripRef; stop?: string; onlyHere?: boolean }> = ({
	trip,
	stop,
	onlyHere = false,
}) => {
	const marks = useTripMarks()(trip, stop)
	if (!marks) return null

	const { arrivedHere, missingHere, lastArrived } = marks

	if (arrivedHere) {
		return (
			<span className={`${styles.badge} ${delayClass(arrivedHere.delay ?? 0)}`}>
				✓ {fromMinutes(arrivedHere.at)}
				{arrivedHere.delay !== null && ` ${formatDelay(arrivedHere.delay)}`}
			</span>
		)
	}

	if (missingHere > 0) return <span className={`${styles.badge} ${styles.bad}`}>✕ не пришёл</span>

	if (!onlyHere && lastArrived?.delay != null) {
		return (
			<span
				className={`${styles.badge} ${styles.remote} ${delayClass(lastArrived.delay)}`}
				title={`Отметили на «${lastArrived.stop}» в ${fromMinutes(lastArrived.at)}`}
			>
				~{formatDelay(lastArrived.delay)}
			</span>
		)
	}

	return null
}
