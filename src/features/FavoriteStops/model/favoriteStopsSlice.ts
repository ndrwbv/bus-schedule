import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from 'App/model/configureStore'
import { StopKeys } from 'widget/Schedule/types/Stops'
import { getFavoriteBusStop } from '../helpers/getFavoriteBusStop'

export interface FavoriteStopsState {
	stops: StopKeys[]
}

const initialState: FavoriteStopsState = {
	stops: getFavoriteBusStop(),
}

export const favoriteStopsSlice = createSlice({
	name: 'favoriteStopsSlice',
	initialState,
	reducers: {
		saveFavoriteBusStops: (state, action: PayloadAction<StopKeys[]>) => {
			state.stops = action.payload
			localStorage.setItem('favoriteStops', JSON.stringify(state.stops))
		},
	},
})

// Action creators are generated for each case reducer function
export const { saveFavoriteBusStops } = favoriteStopsSlice.actions

export const favoriteStopsSelector = (state: RootState) => state.favoriteStops.stops

export default favoriteStopsSlice.reducer
