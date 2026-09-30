import { DirectionsNew } from 'shared/store/busStop/Stops'

/** The trip a passenger waits for. `approx` — the stop's time is interpolated, shown as «~13:28» */
export interface WaitTrip {
	time: string
	tripIndex: number
	dayKey: number
	approx: boolean
}

/**
 * A passenger waiting at a stop (spec 15, «опрос на остановке»). Kept in localStorage so a reload
 * or a locked phone doesn't lose it — the questions are about *this* wait, not a page visit.
 */
export interface WaitState {
	day: string
	stopId: string
	stopLabel: string
	direction: DirectionsNew
	/** «в город» / «из города» for stops served both ways */
	directionText: string | null
	trip: WaitTrip
	/** Minutes since midnight (Tomsk) when we learned they are at the stop */
	presenceAt: number
	/** Here by the scheduled time — then «ещё нет» is a real delay, not a missed bus */
	onTime: boolean
	/** When to ask «Автобус пришёл?» next, minutes since midnight */
	askAt: number
	/** How many times we asked already */
	asks: number
	/** Last «Ещё нет» — the bus came after it, so «пришёл 5 мин назад» can't be earlier */
	notYetAt: number | null
	/** Where they stood, when we know it — leaving it means they most likely got on the bus */
	where: [number, number] | null
}

const WAIT_KEY = `severbus:wait`
const DISMISSED_KEY = `severbus:wait-dismissed`
const DONE_KEY = `severbus:wait-done`

/** «Нет, я не на остановке» — don't ask about this stop again for a while; twice a day — until tomorrow */
const DISMISS_MS = 60 * 60 * 1000
const DISMISSALS_PER_DAY = 2

interface Dismissal {
	day: string
	until: number
	count: number
}

export const todayInTomsk = (): string => new Date().toLocaleDateString(`sv-SE`, { timeZone: `Asia/Tomsk` })

const read = <T>(key: string, fallback: T): T => {
	try {
		const raw = localStorage.getItem(key)

		return raw ? (JSON.parse(raw) as T) : fallback
	} catch {
		return fallback
	}
}

const write = (key: string, value: unknown): void => {
	try {
		if (value === null) localStorage.removeItem(key)
		else localStorage.setItem(key, JSON.stringify(value))
	} catch {
		// Private mode or full storage: the questions still work until the page is reloaded
	}
}

export const loadWait = (): WaitState | null => {
	const wait = read<WaitState | null>(WAIT_KEY, null)

	return wait && wait.day === todayInTomsk() ? wait : null
}

export const saveWait = (wait: WaitState | null): void => write(WAIT_KEY, wait)

const readDismissals = (): Record<string, Dismissal | undefined> => read(DISMISSED_KEY, {})

export const isDismissed = (stopId: string): boolean => {
	const d = readDismissals()[stopId]
	if (!d || d.day !== todayInTomsk()) return false

	return d.count >= DISMISSALS_PER_DAY || d.until > Date.now()
}

export const dismissStop = (stopId: string): void => {
	const all = readDismissals()
	const today = todayInTomsk()
	const prev = all[stopId]
	const count = prev?.day === today ? prev.count + 1 : 1
	write(DISMISSED_KEY, { ...all, [stopId]: { day: today, until: Date.now() + DISMISS_MS, count } })
}

const doneKey = (stopId: string, time: string): string => `${todayInTomsk()}|${stopId}|${time}`

/** We already heard all we'll ask about this trip at this stop today */
export const isTripDone = (stopId: string, time: string): boolean =>
	read<string[]>(DONE_KEY, []).includes(doneKey(stopId, time))

export const markTripDone = (stopId: string, time: string): void => {
	const today = todayInTomsk()
	const kept = read<string[]>(DONE_KEY, []).filter(k => k.startsWith(today))
	write(DONE_KEY, [...kept, doneKey(stopId, time)])
}
