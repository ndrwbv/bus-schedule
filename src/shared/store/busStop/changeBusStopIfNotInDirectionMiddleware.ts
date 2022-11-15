import { createListenerMiddleware } from '@reduxjs/toolkit';
import { getDirectionKeys } from 'widget/Schedule/helpers/getDirectionKeys';
import { setBusStop, setDirection } from 'shared/store/busStop/busStopInfoSlice';
import { StopKeys } from 'widget/Schedule/types/Stops';
import { RootState, store } from '../../../App/model/configureStore';

// Create the middleware instance and methods
export const changeBusStopOnDirection = createListenerMiddleware();

changeBusStopOnDirection.startListening({
	actionCreator: setDirection,
	effect: async (action, listenerApi) => {
		const state = listenerApi.getState() as RootState;

		const scheduleKeys = getDirectionKeys(
			state.scheduleSlice.schedule,
			action.payload,
			state.scheduleSlice.currentDayKey
		);

		if (state.busStopInfo.busStop && !scheduleKeys.includes(state.busStopInfo.busStop)) {
			store.dispatch(setBusStop(scheduleKeys[0] as StopKeys));
		}
	},
});

export const changeBusStopOnBusStopChange = createListenerMiddleware();

changeBusStopOnBusStopChange.startListening({
	actionCreator: setBusStop,
	effect: async (action, listenerApi) => {
		const state = listenerApi.getState() as RootState;

		const scheduleKeys = getDirectionKeys(
			state.scheduleSlice.schedule,
			state.busStopInfo.direction,
			state.scheduleSlice.currentDayKey
		);

		if (action.payload && !scheduleKeys.includes(action.payload)) {
			store.dispatch(setBusStop(scheduleKeys[0] as StopKeys));
		}
	},
});
