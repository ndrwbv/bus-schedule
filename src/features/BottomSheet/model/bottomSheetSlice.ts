import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from 'shared/store/app/configureStore'

export enum BottomSheetStates {
	'TOP' = 1, // 90% open
	'MID' = 2, // 50/50
	'BOTTOM' = 3, // 30% open
}
export interface BottomSheetState {
	position: BottomSheetStates
}

const initialState: BottomSheetState = {
	position: BottomSheetStates.MID,
}

export const bottomSheetSlice = createSlice({
	name: `bottomSheetSlice`,
	initialState,
	reducers: {
		setBottomSheetPosition: (state, action: PayloadAction<BottomSheetStates>) => {
			state.position = action.payload
		},
	},
})

// Action creators are generated for each case reducer function
export const { setBottomSheetPosition } = bottomSheetSlice.actions

export const bottomSheetPositionSelector = (state: RootState): BottomSheetStates => state.bottomSheetSlice.position

export default bottomSheetSlice.reducer
