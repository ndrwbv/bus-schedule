import { RootState } from 'shared/store/app/configureStore'
import { TypedUseSelectorHook, useSelector } from 'react-redux'

export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector
