import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { BottomSheet, BottomSheetRef } from 'react-spring-bottom-sheet'

import { getSnapPoints, getSnapValue, snapBottom, snapMid, snapTop } from './helpers/getSnapPoints'
import {
	bottomSheetPositionSelector,
	BottomSheetStates,
	maxHeightSelector,
	setBottomSheetPosition,
	setMaxHeight,
} from './model/bottomSheetSlice'

interface IProps {
	children: JSX.Element
	header?: JSX.Element
}
export const BottomSheetCustom: React.FC<IProps> = ({ children, header }) => {
	const sheetRef = useRef<BottomSheetRef>(null)
	const [expandOnContentDrag] = useState<boolean>(true)
	const focusRef = useRef<HTMLButtonElement>(null)
	const dispatch = useDispatch()
	const bottomSheetMaxHeight = useSelector(maxHeightSelector)

	const bottomSheetPostion = useSelector(bottomSheetPositionSelector)

	useEffect(() => {
		if (sheetRef.current) {
			sheetRef.current.snapTo(({ maxHeight }) => getSnapValue(bottomSheetPostion, maxHeight))
		}
	}, [bottomSheetPostion])

	const getDefaultSnap = ({ maxHeight }: { maxHeight: number }): number => {
		if (maxHeight !== bottomSheetMaxHeight) {
			dispatch(setMaxHeight(maxHeight))
		}

		return snapMid(maxHeight)
	}

	const handleSpringEnd = (): void => {
		const currentMaxHeight = sheetRef.current?.height

		if (bottomSheetMaxHeight === undefined || !currentMaxHeight) return

		if (
			currentMaxHeight >= Math.floor(snapBottom(bottomSheetMaxHeight)) &&
			currentMaxHeight < Math.floor(snapMid(bottomSheetMaxHeight))
		) {
			dispatch(setBottomSheetPosition(BottomSheetStates.BOTTOM))

			return
		}

		if (
			currentMaxHeight >= Math.floor(snapMid(bottomSheetMaxHeight)) &&
			currentMaxHeight < Math.floor(snapTop(bottomSheetMaxHeight))
		) {
			dispatch(setBottomSheetPosition(BottomSheetStates.MID))

			return
		}

		dispatch(setBottomSheetPosition(BottomSheetStates.TOP))
	}

	return (
		<BottomSheet
			open
			skipInitialTransition
			ref={sheetRef}
			initialFocusRef={focusRef}
			defaultSnap={getDefaultSnap}
			snapPoints={getSnapPoints}
			expandOnContentDrag={expandOnContentDrag}
			blocking={false}
			onSpringEnd={handleSpringEnd}
			header={header}
		>
			{children}
		</BottomSheet>
	)
}
