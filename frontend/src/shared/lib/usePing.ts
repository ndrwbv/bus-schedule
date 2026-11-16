import { useEffect } from 'react'

import { getUserId } from './getUserId'

const API_BASE = import.meta.env.VITE_API_URL || `/api`

/** Send a single ping to the backend on mount to track unique visitors */
export const usePing = (): void => {
	useEffect(() => {
		try {
			fetch(`${API_BASE}/ping`, {
				method: `POST`,
				headers: { 'Content-Type': `application/json` },
				body: JSON.stringify({ user_id: getUserId() }),
			}).catch(() => {})
		} catch {
			// Swallow any sync errors so a dead ping never breaks render
		}
	}, [])
}
