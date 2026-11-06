import { UserDirection } from 'shared/store/busStop/Stops'

import styles from './directionChip.module.css'

export const USER_DIRECTION_SHORT: Record<UserDirection, string> = {
	[UserDirection.toCity]: `в город`,
	[UserDirection.fromCity]: `из города`,
}

export const DirectionChip: React.FC<{ direction: UserDirection }> = ({ direction }) => (
	<span className={styles.chip}>{USER_DIRECTION_SHORT[direction]}</span>
)
