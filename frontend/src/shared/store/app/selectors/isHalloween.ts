import { RootState } from '../configureStore'

export const isHalloween = (state: RootState): boolean => state.featureToggle.isHalloweenMode
