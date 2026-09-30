import React, { createContext, useContext, useMemo } from 'react'

import { DelayStat } from './Complains'
import { IComplains, IComplainsResponse, useComplains } from './useComplains'

const DEFAULT_PROPS = {
	complains: [],
	delays: [],
	addComplain: () => {},
}

export const ComplainsContext = createContext<ContextProps>(DEFAULT_PROPS)

interface ContextProps {
	complains: IComplainsResponse[]
	delays: DelayStat[]
	addComplain: (data: IComplains) => void
}

interface IProviderProps {
	children: React.ReactElement
}
export const ComplainsProvider = ({ children }: IProviderProps): JSX.Element => {
	const { complains, delays, addComplain } = useComplains()

	const values = useMemo(() => ({ complains, delays, addComplain }), [addComplain, complains, delays])

	return <ComplainsContext.Provider value={values}>{children}</ComplainsContext.Provider>
}

export const useComplainsContext = (): ContextProps => {
	return useContext(ComplainsContext)
}
