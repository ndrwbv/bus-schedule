import { configureStore } from '@reduxjs/toolkit'
import favoriteStops from 'features/FavoriteStops/model/favoriteStopsSlice'
import { infoApi } from 'features/Info/model/info'
import busStopInfo from 'shared/store/busStop/busStopInfoSlice'
import {
	changeBusStopOnBusStopChange,
	changeBusStopOnDirection,
} from 'shared/store/busStop/changeBusStopIfNotInDirectionMiddleware'
import { holidaysSetter } from 'shared/store/holidays/holidaysMiddleware'
import holidaysSlice from 'shared/store/holidays/holidaysSlice'
import scheduleSlice from 'shared/store/schedule/scheduleSlice'
import timeLeftSlice from 'shared/store/timeLeft/timeLeftSlice'

import featureToggle from './featureToggleSlice'

export const store = configureStore({
	reducer: {
		featureToggle,
		busStopInfo,
		scheduleSlice,
		favoriteStops,
		holidaysSlice,
		timeLeftSlice,
		[infoApi.reducerPath]: infoApi.reducer,
	},
	devTools: process.env.NODE_ENV !== `production`,
	middleware: getDefaultMiddleware =>
		getDefaultMiddleware().prepend([
			changeBusStopOnDirection.middleware,
			changeBusStopOnBusStopChange.middleware,
			holidaysSetter.middleware,
			infoApi.middleware,
		]),
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
