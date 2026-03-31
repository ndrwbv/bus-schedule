import { configureStore } from '@reduxjs/toolkit'
import bottomSheetSlice from 'features/BottomSheet/model/bottomSheetSlice'
import favoriteStops from 'features/FavoriteStops/model/favoriteStopsSlice'
import { infoApi } from 'features/Info/model/info'
import myLocationSlice from 'features/MyLocation/model/myLocationSlice'
import settings from 'features/Settings/model/settingsSlice'
import { scheduleApi } from 'shared/api/scheduleApi'
import busStopInfo from 'shared/store/busStop/busStopInfoSlice'
import { holidaysSetter } from 'shared/store/holidays/holidaysMiddleware'
import holidaysSlice from 'shared/store/holidays/holidaysSlice'
import scheduleSlice from 'shared/store/schedule/scheduleSlice'
import timeLeftSlice from 'shared/store/timeLeft/timeLeftSlice'

import featureToggle from './featureToggleSlice'

export const store = configureStore({
	reducer: {
		featureToggle,
		settings,
		busStopInfo,
		scheduleSlice,
		favoriteStops,
		holidaysSlice,
		timeLeftSlice,
		bottomSheetSlice,
		myLocationSlice,
		[infoApi.reducerPath]: infoApi.reducer,
		[scheduleApi.reducerPath]: scheduleApi.reducer,
	},
	devTools: process.env.NODE_ENV !== `production`,
	middleware: getDefaultMiddleware =>
		getDefaultMiddleware().prepend(holidaysSetter.middleware, infoApi.middleware, scheduleApi.middleware),
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
