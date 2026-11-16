import { useCallback, useEffect, useRef, useState } from 'react'
import { getUserId } from 'shared/lib/getUserId'
import { Directions, StopKeys } from 'shared/store/busStop/Stops'

import { ComplainType } from './Complains'

const API_BASE = import.meta.env.VITE_API_URL || `/api`
const POLL_INTERVAL_MS = 30_000
const SUBMIT_TIMEOUT_MS = 15_000

export interface IComplains {
	stop: StopKeys
	direction: Directions
	type: ComplainType
}

export interface IComplainsResponse {
	id: number
	stop: string
	direction: string
	type: string
	date: string
}

type SubmitResult = 'sent' | 'rateLimited' | 'failed'

export interface ComplainsState {
	complains: IComplainsResponse[]
	loadFailed: boolean
	addComplain: (data: IComplains) => Promise<SubmitResult>
}

export const useComplains = (): ComplainsState => {
	const [complains, setComplains] = useState<IComplainsResponse[]>([])
	const [loadFailed, setLoadFailed] = useState(false)
	const listRequest = useRef<AbortController>()

	const fetchComplains = useCallback(async (): Promise<void> => {
		listRequest.current?.abort()
		const request = new AbortController()
		listRequest.current = request

		try {
			const response = await fetch(`${API_BASE}/complains`, { signal: request.signal, cache: `no-cache` })
			if (!response.ok) throw new Error(`HTTP ${response.status}`)
			const data: unknown = await response.json()
			if (!Array.isArray(data)) throw new Error(`Expected a list of complaints`)

			if (request.signal.aborted) return
			setComplains(data as IComplainsResponse[])
			setLoadFailed(false)
		} catch (err) {
			if (request.signal.aborted) return
			setLoadFailed(true)
			console.error(`[complains] fetch error:`, err)
		}
	}, [])

	useEffect(() => {
		void fetchComplains()
		const interval = setInterval(() => {
			void fetchComplains()
		}, POLL_INTERVAL_MS)

		return () => {
			clearInterval(interval)
			listRequest.current?.abort()
		}
	}, [fetchComplains])

	const addComplain = useCallback(
		async (data: IComplains): Promise<SubmitResult> => {
			const request = new AbortController()
			const timeout = setTimeout(() => request.abort(), SUBMIT_TIMEOUT_MS)

			try {
				const response = await fetch(`${API_BASE}/complains`, {
					method: `POST`,
					headers: { 'Content-Type': `application/json` },
					body: JSON.stringify({ ...data, user_id: getUserId() }),
					signal: request.signal,
				})
				if (response.status === 429) return `rateLimited`
				if (response.status !== 201) throw new Error(`HTTP ${response.status}`)

				void fetchComplains()

				return `sent`
			} catch (err) {
				console.error(`[complains] post error:`, err)

				return `failed`
			} finally {
				clearTimeout(timeout)
			}
		},
		[fetchComplains],
	)

	return { complains, loadFailed, addComplain }
}
