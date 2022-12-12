import { useEffect } from 'react'
import { AndrewLytics } from 'shared/lib'

import { IComplains, IComplainsResponse } from './Complains'
import { useComplainMutation, useFindComplainMutation } from './complainsApi'

interface IReturns {
	complains: IComplainsResponse[] | undefined
	addComplain: (data: IComplains) => void
}

export const useComplains = (): IReturns => {
	const [addComplainMutation] = useComplainMutation()
	const [fetchFindComplains, { data: complains}] = useFindComplainMutation()

	useEffect(() => {
		console.log(1)
		void fetchFindComplains()
		const interval = setInterval(() => {
			console.log(2)
			void fetchFindComplains()
		}, 5000)

		return () => {
			clearInterval(interval)
		}
	}, [fetchFindComplains])

	const addComplain = (data: IComplains): void => {
		AndrewLytics(`addComplainMethod`)

		addComplainMutation({ data }).catch(() => {})
	}

	return { complains, addComplain }
}
