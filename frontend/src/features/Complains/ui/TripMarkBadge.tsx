import { TripRef } from 'shared/store/busStop/const/stops'

import { fromMinutes } from '../lib/matchReports'
import { useTripMarks } from '../model/useCrowdReports'
import styles from './tripMarkBadge.module.css'

const delayClass = (delay: number | null): string => (delay !== null && delay > 1 ? styles.late : styles.good)

/**
 * A trip's crowd status at one stop, in words: «пришёл в 12:34» when it was marked here,
 * «опаздывает ~8 мин» when it was marked earlier along the route today (`onlyHere` hides that —
 * used in the trip modal, where every stop gets its own badge). «По расписанию» is not shown.
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
			<span className={`${styles.badge} ${delayClass(arrivedHere.delay)}`}>
				пришёл в {fromMinutes(arrivedHere.at)}
			</span>
		)
	}

	if (missingHere > 0) return <span className={`${styles.badge} ${styles.bad}`}>не пришёл</span>

	const delay = onlyHere ? null : lastArrived?.delay ?? null
	if (delay === null || Math.abs(delay) <= 1) return null

	return (
		<span className={`${styles.badge} ${delayClass(delay)}`}>
			{delay > 0 ? `опаздывает ~${delay} мин` : `раньше ~${-delay} мин`}
		</span>
	)
}
