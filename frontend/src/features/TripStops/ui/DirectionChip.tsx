import { UserDirection } from 'shared/store/busStop/Stops'

import styles from './directionChip.module.css'

export const USER_DIRECTION_SHORT: Record<UserDirection, string> = {
	[UserDirection.toCity]: `в город`,
	[UserDirection.fromCity]: `из города`,
}

/** Where the bus goes from here — same colours as the pins on the map */
export const DirectionChip: React.FC<{ direction: UserDirection }> = ({ direction }) => (
	<span className={`${styles.chip} ${direction === UserDirection.toCity ? styles.toCity : styles.fromCity}`}>
		{USER_DIRECTION_SHORT[direction]} →
	</span>
)
