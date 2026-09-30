import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
	dismissStop,
	isDismissed,
	isTripDone,
	loadWait,
	markTripDone,
	saveWait,
	todayInTomsk,
	WaitState,
} from '../waitState'

const memory = (): Storage => {
	let data: Record<string, string> = {}

	return {
		getItem: k => data[k] ?? null,
		setItem: (k, v) => {
			data[k] = v
		},
		removeItem: k => {
			delete data[k]
		},
		clear: () => {
			data = {}
		},
		key: () => null,
		length: 0,
	}
}

const HOUR = 60 * 60 * 1000

describe(`хранилище опроса на остановке`, () => {
	beforeEach(() => {
		vi.stubGlobal(`localStorage`, memory())
		vi.useFakeTimers()
		// 11:00 in Tomsk
		vi.setSystemTime(new Date(`2026-09-30T04:00:00Z`))
	})

	afterEach(() => {
		vi.useRealTimers()
		vi.unstubAllGlobals()
	})

	it(`«Нет» — час не спрашиваем, потом снова можно`, () => {
		dismissStop(`24`)
		expect(isDismissed(`24`)).toBe(true)

		vi.advanceTimersByTime(HOUR + 1000)
		expect(isDismissed(`24`)).toBe(false)
	})

	it(`второе «Нет» за день — не спрашиваем до завтра`, () => {
		dismissStop(`24`)
		vi.advanceTimersByTime(2 * HOUR)
		dismissStop(`24`)

		vi.advanceTimersByTime(5 * HOUR)
		expect(isDismissed(`24`)).toBe(true)

		// Next morning in Tomsk
		vi.setSystemTime(new Date(`2026-10-01T01:00:00Z`))
		expect(isDismissed(`24`)).toBe(false)
	})

	it(`отказ на одной остановке не касается другой`, () => {
		dismissStop(`24`)
		expect(isDismissed(`16`)).toBe(false)
	})

	it(`опрошенный рейс помнится до конца дня`, () => {
		markTripDone(`24`, `13:35`)
		expect(isTripDone(`24`, `13:35`)).toBe(true)
		expect(isTripDone(`24`, `14:25`)).toBe(false)

		vi.setSystemTime(new Date(`2026-10-01T01:00:00Z`))
		expect(isTripDone(`24`, `13:35`)).toBe(false)
	})

	it(`вчерашнее ожидание не поднимается`, () => {
		saveWait({ day: todayInTomsk() } as WaitState)
		expect(loadWait()).not.toBeNull()

		vi.setSystemTime(new Date(`2026-10-01T01:00:00Z`))
		expect(loadWait()).toBeNull()
	})

	it(`без localStorage (приватный режим) ничего не падает`, () => {
		vi.stubGlobal(`localStorage`, {
			getItem: () => {
				throw new Error(`denied`)
			},
			setItem: () => {
				throw new Error(`denied`)
			},
		})

		expect(() => dismissStop(`24`)).not.toThrow()
		expect(isDismissed(`24`)).toBe(false)
		expect(loadWait()).toBeNull()
	})
})
