import { useEffect } from 'react'

const API_BASE = (import.meta as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL || `/api`
const USER_ID_KEY = `severbus:user_id`

function getUserId(): string {
	let id = localStorage.getItem(USER_ID_KEY)
	if (!id) {
		id = crypto.randomUUID()
		localStorage.setItem(USER_ID_KEY, id)
	}

	return id
}

/** Send a single ping to the backend on mount to track unique visitors */
export const usePing = (): void => {
	useEffect(() => {
		fetch(`${API_BASE}/ping`, {
			method: `POST`,
			headers: { 'Content-Type': `application/json` },
			body: JSON.stringify({ user_id: getUserId() }),
		}).catch(() => {})
	}, [])
}
