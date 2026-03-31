import { useDispatch, useSelector } from 'react-redux'
import { Drawer } from 'vaul'

import styles from './BottomSheet.module.css'
import { bottomSheetPositionSelector, BottomSheetStates, setBottomSheetPosition } from './model/bottomSheetSlice'

const SNAP_POINTS = [0.2, 0.5, 0.8]

const positionToSnap = (pos: BottomSheetStates): number => {
	if (pos === BottomSheetStates.BOTTOM) return 0.2
	if (pos === BottomSheetStates.TOP) return 0.8

	return 0.5
}

const snapToPosition = (snap: number | string | null): BottomSheetStates => {
	if (snap === 0.8) return BottomSheetStates.TOP
	if (snap === 0.2) return BottomSheetStates.BOTTOM

	return BottomSheetStates.MID
}

interface IProps {
	children: React.ReactNode
	header?: React.ReactNode
}

export const BottomSheetCustom: React.FC<IProps> = ({ children, header }) => {
	const dispatch = useDispatch()
	const position = useSelector(bottomSheetPositionSelector)
	const activeSnap = positionToSnap(position)

	const handleSnapChange = (snap: number | string | null): void => {
		dispatch(setBottomSheetPosition(snapToPosition(snap)))
	}

	return (
		<Drawer.Root
			open
			modal={false}
			snapPoints={SNAP_POINTS}
			activeSnapPoint={activeSnap}
			setActiveSnapPoint={handleSnapChange}
			dismissible={false}
		>
			<Drawer.Portal>
				<Drawer.Content className={styles.content}>
					<div className={styles.handleArea}>
						{header}
						<div className={styles.handle} />
					</div>
					<div className={styles.scrollArea} data-vaul-no-drag>{children}</div>
				</Drawer.Content>
			</Drawer.Portal>
		</Drawer.Root>
	)
}
