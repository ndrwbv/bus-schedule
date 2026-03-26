import { TypedUseSelectorHook, useSelector } from 'react-redux'
import { RootState } from 'shared/store/app/configureStore'

export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector
