import { useDispatch } from 'react-redux'
import { AndrewLytics } from 'shared/lib'
import { TaggedTime } from 'shared/store/busStop/Stops'

import { openTrip } from '../model/tripStopsSlice'
import styles from './tripTimeRow.module.css'

const VIA_LABELS: Record<string, string> = {
	park: `через парк`,
	lb: `через ЛБ`,
}

/** One departure in a time list. Tap → the whole trip with every stop. `badge` — what passengers marked */
export const TripTimeRow: React.FC<{ item: TaggedTime; badge?: React.ReactNode }> = ({ item, badge }) => {
	const dispatch = useDispatch()

	const handleClick = (): void => {
		dispatch(openTrip({ direction: item.direction, dayKey: item.dayKey, tripIndex: item.tripIndex }))
		AndrewLytics(`trip:open`)
	}

	return (
		<button className={styles.row} type="button" onClick={handleClick}>
			<span className={styles.time}>
				{item.interpolated ? `~` : ``}
				{item.time}
			</span>
			{item.via && <span className={styles.via}>{VIA_LABELS[item.via]}</span>}
			{item.interpolated && item.interpolatedFrom && (
				<span className={styles.approx}>(на основе: {item.interpolatedFrom})</span>
			)}
			{badge}
			<span className={styles.more}>остановки ›</span>
		</button>
	)
}
