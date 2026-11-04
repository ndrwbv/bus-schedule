import { describe, expect, it } from 'vitest'

import { isNovemberRoute, ROUTE_TABLES } from '../model'

describe(`November carrier tables`, () => {
	it(`switches at midnight in Tomsk, not the device timezone`, () => {
		expect(isNovemberRoute(Date.parse(`2026-11-06T16:59:59Z`))).toBe(false)
		expect(isNovemberRoute(Date.parse(`2026-11-06T17:00:00Z`))).toBe(true)
	})
	it(`keeps every trip column including shortened first trips`, () => {
		expect(ROUTE_TABLES.map(table => table.rows[0].times.length)).toEqual([13, 13, 8, 7])
		for (const table of ROUTE_TABLES) {
			for (const row of table.rows) {
				expect(row.times).toHaveLength(table.rows[0].times.length)
				for (const time of row.times) {
					if (time !== null) expect(time).toMatch(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
				}
			}
		}
		expect(ROUTE_TABLES[0].rows[0].times[0]).toBeNull()
		expect(ROUTE_TABLES[0].rows[3].times[0]).toBe(`06:05`)
	})
	it(`preserves repeated visits in route order`, () => {
		for (const table of ROUTE_TABLES) {
			expect(table.rows.filter(row => row.stop === `ул. М. Цветаевой`)).toHaveLength(2)
		}
		expect(ROUTE_TABLES[1].rows.filter(row => row.stop === `Почта`)).toHaveLength(2)
		expect(ROUTE_TABLES[3].rows[0].times[6]).toBe(`18:43`)
	})
})
