import { createListenerMiddleware } from '@reduxjs/toolkit';
import { getDirectionKeys } from 'widget/Schedule/helpers/getDirectionKeys';
import { setBusStop, setDirection } from 'widget/Schedule/model/busStopInfoSlice';
import { StopKeys } from 'widget/Schedule/types/Stops';
import { RootState, store } from '../../../App/model/configureStore';

// Create the middleware instance and methods
export const listenerMiddleware = createListenerMiddleware();
listenerMiddleware.startListening({
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
