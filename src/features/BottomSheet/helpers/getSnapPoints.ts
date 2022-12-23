import { BottomSheetStates } from '../model/bottomSheetSlice'

export const snapTop = (maxHeight: number): number => maxHeight - maxHeight / 10
export const snapMid = (maxHeight: number): number => maxHeight / 2
export const snapBottom = (maxHeight: number): number => maxHeight * 0.6

export const getSnapPoints = ({ maxHeight }: { maxHeight: number }): number[] => {
	return [snapTop(maxHeight), snapMid(maxHeight), snapBottom(maxHeight)]
}

export const getSnapValue = (snap: BottomSheetStates, maxHeight: number): number => {
	switch (snap) {
		case BottomSheetStates.TOP:
			return snapTop(maxHeight)
		case BottomSheetStates.MID:
			return snapMid(maxHeight)
		case BottomSheetStates.BOTTOM:
			return snapBottom(maxHeight)
		default:
			return snapMid(maxHeight)
	}
}
