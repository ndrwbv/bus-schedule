import { useEffect } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || `/api`
const USER_ID_KEY = `severbus:user_id`

/**
 * Generate a UUID v4 with a fallback for non-secure contexts.
 * `crypto.randomUUID()` is only available in HTTPS / localhost; dev access
 * over a LAN IP (e.g. http://192.168.x.x) falls through to Math.random().
 */
function generateUUID(): string {
	if (typeof crypto !== `undefined` && typeof crypto.randomUUID === `function`) {
		return crypto.randomUUID()
	}

	if (typeof crypto !== `undefined` && typeof crypto.getRandomValues === `function`) {
		// RFC4122 v4-compliant UUID via getRandomValues
		const bytes = crypto.getRandomValues(new Uint8Array(16))
		bytes[6] = (bytes[6] & 0x0f) | 0x40 // version 4
		bytes[8] = (bytes[8] & 0x3f) | 0x80 // variant 10
		const hex = Array.from(bytes, b => b.toString(16).padStart(2, `0`)).join(``)

		return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
	}

	// Last-resort, non-cryptographic fallback (very old browsers)
	return `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`.replace(/[xy]/g, c => {
		const r = (Math.random() * 16) | 0
		const v = c === `x` ? r : (r & 0x3) | 0x8

		return v.toString(16)
	})
}

function getUserId(): string {
	let id: string | null = null
	try {
		id = localStorage.getItem(USER_ID_KEY)
	} catch {
		// localStorage may be unavailable (private mode, quota, etc.)
	}

	if (!id) {
		id = generateUUID()
		try {
			localStorage.setItem(USER_ID_KEY, id)
		} catch {
			// ignore — we'll just generate a new id next time
		}
	}

	return id
}

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
