import React, { createContext, useContext, useMemo } from 'react'

import { IComplains } from './Complains'
import { IComplainsResponse, useComplains } from './useComplains'

const DEFAULT_PROPS = {
	complains: [],
	addComplain: () => {},
}

export const ComplainsContext = createContext<ContextProps>(DEFAULT_PROPS)

interface ContextProps {
	complains: IComplainsResponse[]
	addComplain: (data: IComplains) => void
}

interface IProviderProps {
	children: React.ReactElement
}
export const ComplainsProvider = ({ children }: IProviderProps): JSX.Element => {
	const { complains, addComplain } = useComplains()

	const values = useMemo(() => ({ complains, addComplain }), [addComplain, complains])

	return <ComplainsContext.Provider value={values}>{children}</ComplainsContext.Provider>
}

export const useComplainsContext = (): ContextProps => {
	return useContext(ComplainsContext)
}
