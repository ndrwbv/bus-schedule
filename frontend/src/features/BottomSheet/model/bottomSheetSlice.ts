import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from 'shared/store/app/configureStore'

export enum BottomSheetStates {
	'TOP' = 1, // 90% open
	'MID' = 2, // 50/50
	'BOTTOM' = 3, // 30% open
}
export interface BottomSheetState {
	position: BottomSheetStates
	maxHeight: number | undefined
}

const initialState: BottomSheetState = {
	position: BottomSheetStates.MID,
	maxHeight: undefined,
}

export const bottomSheetSlice = createSlice({
	name: `bottomSheetSlice`,
	initialState,
	reducers: {
		setBottomSheetPosition: (state, action: PayloadAction<BottomSheetStates>) => {
			state.position = action.payload
		},
		setMaxHeight: (state, action: PayloadAction<number | undefined>) => {
			state.maxHeight = action.payload
		},
	},
})

// Action creators are generated for each case reducer function
export const { setBottomSheetPosition, setMaxHeight } = bottomSheetSlice.actions

export const bottomSheetPositionSelector = (state: RootState): BottomSheetStates => state.bottomSheetSlice.position
export const maxHeightSelector = (state: RootState): number | undefined => state.bottomSheetSlice.maxHeight

export default bottomSheetSlice.reducer
