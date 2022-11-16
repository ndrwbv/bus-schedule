import { RootState } from '../configureStore'

export const isHalloween = (state: RootState) => state.featureToggle.isHalloweenMode
