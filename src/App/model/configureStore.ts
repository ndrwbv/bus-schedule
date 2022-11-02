import { configureStore } from '@reduxjs/toolkit'
import featureToggle from 'App/model/featureToggleSlice'
import busStopInfo from 'widget/Schedule/model/BusStopInfoSlice'

export const store = configureStore({
	reducer: {
		featureToggle,
		busStopInfo,
	},
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
