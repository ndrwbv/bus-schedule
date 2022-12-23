import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { BottomSheet, BottomSheetRef } from 'react-spring-bottom-sheet'

import { getSnapPoints, getSnapValue, snapMid } from './helpers/getSnapPoints'
import { bottomSheetPositionSelector } from './model/bottomSheetSlice'

interface IProps {
	children: JSX.Element
}
export const BottomSheetCustom: React.FC<IProps> = ({ children }) => {
	const sheetRef = useRef<BottomSheetRef>(null)
	const [expandOnContentDrag] = useState<boolean>(true)
	const focusRef = useRef<HTMLButtonElement>(null)

	const bottomSheetPostion = useSelector(bottomSheetPositionSelector)

	useEffect(() => {
		if (sheetRef.current) {
			sheetRef.current.snapTo(({ maxHeight }) => getSnapValue(bottomSheetPostion, maxHeight))
		}
	}, [bottomSheetPostion])

	console.log(sheetRef.current)

	return (
		<BottomSheet
			open
			skipInitialTransition
			ref={sheetRef}
			initialFocusRef={focusRef}
			defaultSnap={({ maxHeight }) => snapMid(maxHeight)}
			snapPoints={getSnapPoints}
			expandOnContentDrag={expandOnContentDrag}
			blocking={false}
			onSpringEnd={(event) => console.log(event)}
		>
			{children}
		</BottomSheet>
	)
}
