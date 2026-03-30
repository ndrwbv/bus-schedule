const VISIT_DAYS_KEY = `severbus_visit_days`
const BANNER_DISMISSED_KEY = `severbus_donate_banner_dismissed`
const BANNER_DONATED_KEY = `severbus_donate_banner_donated`
const DISMISS_DURATION_MS = 90 * 24 * 60 * 60 * 1000 // 90 days

const getToday = (): string => new Date().toISOString().slice(0, 10)

export const recordVisit = (): void => {
	try {
		const stored = localStorage.getItem(VISIT_DAYS_KEY)
		const days: string[] = stored ? (JSON.parse(stored) as string[]) : []
		const today = getToday()

		if (!days.includes(today)) {
			days.push(today)
			localStorage.setItem(VISIT_DAYS_KEY, JSON.stringify(days))
		}
	} catch {
		// localStorage unavailable
	}
}

export const getVisitDaysCount = (): number => {
	try {
		const stored = localStorage.getItem(VISIT_DAYS_KEY)
		if (!stored) return 0

		return (JSON.parse(stored) as string[]).length
	} catch {
		return 0
	}
}

export const isBannerDismissed = (): boolean => {
	try {
		if (localStorage.getItem(BANNER_DONATED_KEY)) return true

		const dismissed = localStorage.getItem(BANNER_DISMISSED_KEY)
		if (!dismissed) return false

		const dismissedAt = Number(dismissed)

		return Date.now() - dismissedAt < DISMISS_DURATION_MS
	} catch {
		return false
	}
}

export const dismissBanner = (): void => {
	try {
		localStorage.setItem(BANNER_DISMISSED_KEY, String(Date.now()))
	} catch {
		// localStorage unavailable
	}
}

