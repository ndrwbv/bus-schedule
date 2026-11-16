import React, { createContext, useContext, useMemo } from 'react'

import { ComplainsState, useComplains } from './useComplains'

const DEFAULT_PROPS: ComplainsState = {
	complains: [],
	loadFailed: false,
	addComplain: () => Promise.resolve(`failed`),
}

export const ComplainsContext = createContext<ComplainsState>(DEFAULT_PROPS)

interface IProviderProps {
	children: React.ReactElement
}
export const ComplainsProvider = ({ children }: IProviderProps): JSX.Element => {
	const { complains, loadFailed, addComplain } = useComplains()

	const values = useMemo(() => ({ complains, loadFailed, addComplain }), [addComplain, complains, loadFailed])

	return <ComplainsContext.Provider value={values}>{children}</ComplainsContext.Provider>
}

export const useComplainsContext = (): ComplainsState => {
	return useContext(ComplainsContext)
}
