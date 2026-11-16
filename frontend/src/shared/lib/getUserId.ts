const USER_ID_KEY = `severbus:user_id`
let sessionId: string | undefined

function generateUUID(): string {
	if (typeof crypto !== `undefined` && typeof crypto.randomUUID === `function`) {
		return crypto.randomUUID()
	}

	if (typeof crypto !== `undefined` && typeof crypto.getRandomValues === `function`) {
		// RFC4122 v4-compliant UUID for browsers without randomUUID.
		const bytes = crypto.getRandomValues(new Uint8Array(16))
		bytes[6] = (bytes[6] % 16) + 0x40 // version 4
		bytes[8] = (bytes[8] % 64) + 0x80 // variant 10
		const hex = Array.from(bytes, b => b.toString(16).padStart(2, `0`)).join(``)

		return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
	}

	return `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`.replace(/[xy]/g, c => {
		const r = Math.floor(Math.random() * 16)
		const v = c === `x` ? r : (r % 4) + 0x8

		return v.toString(16)
	})
}

export function getUserId(): string {
	if (sessionId) return sessionId

	try {
		const savedId = localStorage.getItem(USER_ID_KEY)
		if (savedId) {
			sessionId = savedId

			return sessionId
		}
	} catch {
		// Keep an ID in memory when browser storage is unavailable.
	}

	sessionId = generateUUID()
	try {
		localStorage.setItem(USER_ID_KEY, sessionId)
	} catch {
		// Ping and complaints can still share the in-memory ID.
	}

	return sessionId
}
