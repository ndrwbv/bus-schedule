import { useCallback, useEffect, useState } from 'react'
import { AndrewLytics } from 'shared/lib'
import { Directions, StopKeys } from 'shared/store/busStop/Stops'

import { ComplainType, DelayStat } from './Complains'

const API_BASE = import.meta.env.VITE_API_URL || `/api`
const POLL_INTERVAL_MS = 30_000
/** The server caches delays for 10 min too — they move over weeks, not minutes */
const DELAYS_INTERVAL_MS = 10 * 60_000

const USER_ID_KEY = `severbus:user_id`

function getUserId(): string {
	let id = localStorage.getItem(USER_ID_KEY)
	if (!id) {
		id = crypto.randomUUID()
		localStorage.setItem(USER_ID_KEY, id)
	}

	return id
}

/** The trip a mark is about, as picked in Fastreply */
export interface IComplainTrip {
	scheduledTime: string
	tripIndex: number
	dayKey: number
}

export interface IComplains {
	stop: StopKeys
	direction: Directions
	date: string
	type: ComplainType
	trip?: IComplainTrip
	/** «Приехал»: when the bus came (HH:MM), if the passenger said «2 мин назад» */
	arrivedAt?: string
	/** «Не приехал»: was the passenger at the stop by the scheduled time */
	wasOnTime?: boolean
}

export interface IComplainsResponse {
	id: number
	stop: string
	direction: string
	type: string
	/** Tomsk wall time, «2026-09-30 11:34:38» */
	date: string
	scheduled_time?: string | null
	trip_index?: number | null
	day_key?: number | null
	delay_min?: number | null
	/** «Не приехал»: 1 — was at the stop by the scheduled time, 0 — came later, null — didn't answer */
	was_on_time?: 0 | 1 | null
	arrived_at?: string | null
}

interface IReturns {
	complains: IComplainsResponse[]
	delays: DelayStat[]
	/** Resolves with the id of the saved mark */
	addComplain: (data: IComplains) => Promise<number | null>
}

/** Same shape the API returns, so optimistic rows parse like the real ones */
export const tomskNowString = (): string =>
	new Date().toLocaleString(`sv-SE`, { timeZone: `Asia/Tomsk` }).replace(`T`, ` `)

export const useComplains = (): IReturns => {
	const [complains, setComplains] = useState<IComplainsResponse[]>([])
	const [delays, setDelays] = useState<DelayStat[]>([])

	const fetchComplains = useCallback((): void => {
		fetch(`${API_BASE}/complains`)
			.then(res => res.json())
			.then((data: IComplainsResponse[]) => {
				setComplains(data)

				return null
			})
			.catch((err: unknown) => {
				console.error(`[complains] fetch error:`, err)
			})
	}, [])

	const fetchDelays = useCallback((): void => {
		fetch(`${API_BASE}/complains/delays`)
			.then(res => res.json())
			.then((data: { stats?: DelayStat[] }) => {
				setDelays(data.stats ?? [])

				return null
			})
			.catch((err: unknown) => {
				console.error(`[complains] delays fetch error:`, err)
			})
	}, [])

	useEffect(() => {
		fetchComplains()
		fetchDelays()
		const interval = setInterval(fetchComplains, POLL_INTERVAL_MS)
		const delaysInterval = setInterval(fetchDelays, DELAYS_INTERVAL_MS)

		return () => {
			clearInterval(interval)
			clearInterval(delaysInterval)
		}
	}, [fetchComplains, fetchDelays])

	const addComplain = useCallback(
		(data: IComplains): Promise<number | null> => {
			AndrewLytics(`addComplainMethod`)

			// Optimistic update
			const optimistic: IComplainsResponse = {
				id: Date.now(),
				stop: data.stop,
				direction: data.direction,
				type: data.type,
				date: tomskNowString(),
				scheduled_time: data.trip?.scheduledTime ?? null,
				trip_index: data.trip?.tripIndex ?? null,
				day_key: data.trip?.dayKey ?? null,
				arrived_at: data.arrivedAt ?? null,
				was_on_time: data.wasOnTime === undefined ? null : data.wasOnTime ? 1 : 0,
			}
			setComplains(prev => [optimistic, ...prev])

			return fetch(`${API_BASE}/complains`, {
				method: `POST`,
				headers: { 'Content-Type': `application/json` },
				body: JSON.stringify({
					stop: data.stop,
					direction: data.direction,
					type: data.type,
					user_id: getUserId(),
					scheduled_time: data.trip?.scheduledTime,
					trip_index: data.trip?.tripIndex,
					day_key: data.trip?.dayKey,
					arrived_at: data.arrivedAt,
					was_on_time: data.wasOnTime,
				}),
			})
				.then(res => res.json() as Promise<{ id?: number }>)
				.then(({ id }) => {
					fetchComplains()

					return id ?? null
				})
				.catch((err: unknown) => {
					console.error(`[complains] post error:`, err)

					return null
				})
		},
		[fetchComplains],
	)

	return { complains, delays, addComplain }
}
