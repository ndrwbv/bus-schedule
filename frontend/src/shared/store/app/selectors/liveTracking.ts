import { RootState } from '../configureStore'

export const liveTrackingEnabledSelector = (state: RootState): boolean => state.featureToggle.liveTracking
