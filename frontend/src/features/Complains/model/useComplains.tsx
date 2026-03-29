import { useCallback, useEffect, useState } from 'react'
import { AndrewLytics } from 'shared/lib'
import { Directions, StopKeys } from 'shared/store/busStop/Stops'

import { ComplainType } from './Complains'

const API_BASE = (import.meta as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL || `/api`
const POLL_INTERVAL_MS = 30_000

const USER_ID_KEY = `severbus:user_id`

function getUserId(): string {
	let id = localStorage.getItem(USER_ID_KEY)
	if (!id) {
		id = crypto.randomUUID()
		localStorage.setItem(USER_ID_KEY, id)
	}

	return id
}

export interface IComplains {
	stop: StopKeys
	direction: Directions
	date: string
	type: ComplainType
}

export interface IComplainsResponse {
	id: number
	stop: string
	direction: string
	type: string
	date: string
}

interface IReturns {
	complains: IComplainsResponse[]
	addComplain: (data: IComplains) => void
}

export const useComplains = (): IReturns => {
	const [complains, setComplains] = useState<IComplainsResponse[]>([])

	const fetchComplains = useCallback((): void => {
		fetch(`${API_BASE}/complains`)
			.then(res => res.json())
			.then((data: IComplainsResponse[]) => {
				setComplains(data)

				return null
			})
			.catch(() => {})
	}, [])

	useEffect(() => {
		fetchComplains()
		const interval = setInterval(fetchComplains, POLL_INTERVAL_MS)

		return () => {
			clearInterval(interval)
		}
	}, [fetchComplains])

	const addComplain = useCallback(
		(data: IComplains): void => {
			AndrewLytics(`addComplainMethod`)

			fetch(`${API_BASE}/complains`, {
				method: `POST`,
				headers: { 'Content-Type': `application/json` },
				body: JSON.stringify({
					stop: data.stop,
					direction: data.direction,
					type: data.type,
					user_id: getUserId(),
				}),
			})
				.then(() => {
					// Refresh list after submitting
					fetchComplains()

					return null
				})
				.catch(() => {})
		},
		[fetchComplains],
	)

	return { complains, addComplain }
}
