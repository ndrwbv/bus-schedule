import useComplains, { IComplains, IComplainsResponse } from 'components/Complains/useComplains'
import React, { useContext, createContext, useEffect, useState } from 'react'

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
export const ComplainsProvider = ({ children }: IProviderProps) => {
	const { complains, addComplain } = useComplains()
	const [visitTime, setVisitTime] = useState(new Date())

	return (
		<ComplainsContext.Provider
			value={{
				complains,
				addComplain,
			}}
		>
			{children}
		</ComplainsContext.Provider>
	)
}

export const useComplainsContext = () => {
	return useContext(ComplainsContext)
}

export default ComplainsProvider
