import { MyLocation } from 'features/MyLocation'

import styles from './bottomSheetHeader.module.css'

export const BottomSheetHeader: React.FC = () => {
	return (
		<div className={styles.container}>
			<MyLocation />
		</div>
	)
}
