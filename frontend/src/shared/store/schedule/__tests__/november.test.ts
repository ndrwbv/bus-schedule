import { readFileSync } from 'node:fs'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
	findLinkedLeg,
	getActiveStops,
	getScheduleTimes,
	getTrip,
	getUserDirectionsForLabel,
	STOPS,
} from '../../busStop/const/stops'
import { DirectionsNew, UserDirection } from '../../busStop/Stops'
import { getCircuitTrip } from '../circuitTrips'
import { CircuitSchedule, ISchedule } from '../ISchedule'
import { addDays, nextWeekdayDate, scheduleDay, tomskDate } from '../serviceDate'

const circuits = JSON.parse(
	readFileSync(new URL(`../../../../../../backend/src/data/schedule-2026-11.json`, import.meta.url), `utf8`),
) as CircuitSchedule
const seed = JSON.parse(
	readFileSync(new URL(`../../../../../../backend/src/data/schedule-seed.json`, import.meta.url), `utf8`),
) as ISchedule
const schedule = { ...seed, circuits } as ISchedule
const { fromCity } = UserDirection
const { toCity } = UserDirection
const times = (
	direction: UserDirection,
	day: number,
	stop: string,
	date = `2026-11-07`,
): ReturnType<typeof getScheduleTimes> => getScheduleTimes(schedule, direction, day, stop, date)

afterEach(() => vi.useRealTimers())

describe(`November in the existing schedule interface`, () => {
	it(`keeps the previous timetable through November 6 and switches at Tomsk midnight`, () => {
		vi.useFakeTimers()
		vi.setSystemTime(new Date(`2026-11-06T16:59:59Z`))
		expect(tomskDate()).toBe(`2026-11-06`)
		const old = getScheduleTimes(seed, fromCity, 5, `Интернационалистов`)
		expect(getScheduleTimes(schedule, fromCity, 5, `Интернационалистов`)).toEqual(old)
		vi.setSystemTime(new Date(`2026-11-06T17:00:00Z`))
		expect(tomskDate()).toBe(`2026-11-07`)
		expect(getScheduleTimes(schedule, fromCity, 6, `Интернационалистов`)).toHaveLength(15)
		expect(getScheduleTimes(schedule, fromCity, 6, `Интернационалистов`)[0]).toMatchObject({
			time: `06:17`,
			via: `lb`,
			tripId: `3:0`,
		})
	})
	it(`previews a future date without changing today's data`, () => {
		vi.useFakeTimers()
		vi.setSystemTime(new Date(`2026-11-04T10:00:00Z`))
		expect(times(fromCity, 6, `Интернационалистов`)).toHaveLength(15)
		expect(getScheduleTimes(schedule, fromCity, 3, `Интернационалистов`)).toEqual(
			getScheduleTimes(seed, fromCity, 3, `Интернационалистов`),
		)
		expect(scheduleDay(`2026-11-04`, [{ name: `holiday`, start: `11-04`, end: `11-04` }])).toBe(0)
		expect(scheduleDay(addDays(`2026-11-06`, 1), [])).toBe(6)
		expect(nextWeekdayDate(`2026-11-06`, [])).toBe(`2026-11-06`)
		expect(nextWeekdayDate(`2026-11-07`, [])).toBe(`2026-11-09`)
	})
	it(`retains both visits and opens the exact same circuit`, () => {
		const entries = times(toCity, 6, `ул. М. Цветаевой`).filter(item => item.tripId === `3:0`)
		expect(entries.map(item => item.time)).toEqual([`07:18`, `07:23`])
		expect(entries.map(item => item.visitLabel)).toEqual([`к Маяку`, `от Маяка`])
		const trip = getTrip(schedule, entries[0].direction, 6, entries[0].tripIndex, entries[0].tripId)
		expect(trip.filter(row => row.stop.label === `Почта`).map(row => row.time)).toEqual([`07:16`, `07:25`])
		const prev = findLinkedLeg(schedule, entries[0], `prev`)
		expect(prev).toMatchObject({ direction: DirectionsNew.inLB, tripId: `3:0`, serviceDate: `2026-11-07` })
	})
	it(`tags the return path, not the outbound path`, () => {
		expect(times(toCity, 6, `Cеребряный бор`).filter(item => item.tripId === `2:0`)[0].via).toBe(`lb`)
		expect(times(toCity, 6, `Cеребряный бор`).filter(item => item.tripId === `3:0`)[0].via).toBe(`park`)
		expect(times(toCity, 6, `Синее небо`)).toHaveLength(8)
		expect(times(fromCity, 6, `Синее небо`)).toHaveLength(0)
		expect(times(fromCity, 6, `ГОАР`)).toHaveLength(7)
		expect(times(toCity, 6, `ГОАР`)).toHaveLength(8)
	})
	it(`does not invent earlier stops for shortened trips or interpolate discontinued branches`, () => {
		const short = getCircuitTrip(schedule, `0:0`, DirectionsNew.inSP)
		expect(short[0]).toMatchObject({ time: `06:05`, stop: { label: `Набережная` } })
		expect(short.some(row => row.stop.label === `ТГУ`)).toBe(false)
		expect(getCircuitTrip(schedule, `1:0`, DirectionsNew.inLB)).toEqual([])
		expect(
			findLinkedLeg(schedule, { direction: DirectionsNew.out, dayKey: 1, tripIndex: 0, tripId: `1:0` }, `prev`),
		).toBeNull()
		expect(times(fromCity, 1, `ТГУ`)).toHaveLength(24)
		expect(times(toCity, 1, `ТГУ`)).toHaveLength(26)
		expect(times(fromCity, 1, `Левитана`)).toEqual([])
	})
	it(`preserves every printed cell in its circuit and checks the alignment of all columns`, () => {
		for (const table of schedule.circuits!.tables) {
			const direction = table.via === `park` ? DirectionsNew.inSP : DirectionsNew.inLB
			for (let column = 0; column < table.rows[0].times.length; column++) {
				const inward = getCircuitTrip(schedule, `${table.id}:${column}`, direction).filter(
					row => !row.interpolated,
				)
				const outward = getCircuitTrip(schedule, `${table.id}:${column}`, DirectionsNew.out).filter(
					row => !row.interpolated,
				)
				const expected = table.rows.map(row => row.times[column]).filter(Boolean)
				const actual = [...inward, ...outward.slice(inward.length ? 1 : 0)].map(row => row.time)
				expect(actual).toEqual(expected)
			}
		}
	})
	it(`keeps stop ids unique, existing favorites and pre-change map pins intact`, () => {
		expect(new Set(STOPS.map(stop => stop.id)).size).toBe(STOPS.length)
		expect(getUserDirectionsForLabel(`Маяк`, `2026-11-06`)).toEqual([toCity])
		expect(getUserDirectionsForLabel(`Маяк`, `2026-11-07`)).toEqual([fromCity, toCity])
		vi.useFakeTimers()
		vi.setSystemTime(new Date(`2026-11-06T10:00:00Z`))
		expect(getActiveStops(schedule, 5).some(stop => stop.id.startsWith(`nov-`))).toBe(false)
		vi.setSystemTime(new Date(`2026-11-07T10:00:00Z`))
		expect(getActiveStops(schedule, 6).some(stop => stop.label === `Левитана`)).toBe(false)
		expect(getActiveStops(schedule, 6).some(stop => stop.label === `ГОАР`)).toBe(true)
	})
})
