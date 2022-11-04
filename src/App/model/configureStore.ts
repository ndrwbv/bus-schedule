import { configureStore } from '@reduxjs/toolkit'
import featureToggle from 'App/model/featureToggleSlice'
import busStopInfo from 'widget/Schedule/model/busStopInfoSlice'
import scheduleSlice from 'widget/Schedule/model/scheduleSlice'
import favoriteStops from 'features/FavoriteStops/model/favoriteStopsSlice'
import { changeBusStopOnDirection } from '../../widget/Schedule/model/changeBusStopIfNotInDirectionMiddleware'

export const store = configureStore({
	reducer: {
		featureToggle,
		busStopInfo,
		scheduleSlice,
		favoriteStops,
	},
	devTools: process.env.NODE_ENV !== 'production',
	middleware: getDefaultMiddleware => getDefaultMiddleware().prepend([changeBusStopOnDirection.middleware]),
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
