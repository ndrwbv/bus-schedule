import { DirectionsNew } from 'shared/store/busStop/Stops'
import { ISchedule } from 'shared/store/schedule/ISchedule'
import { describe, expect, it } from 'vitest'

import { DelayStat } from '../../model/Complains'
import { fromMinutes, matchReport, toMinutes } from '../matchReports'
import { buildStopInsights } from '../stopInsights'
import schedule2026 from './fixtures/schedule-2026-09.json'

/**
 * On the real 2026-09 timetable, Wednesday, «Лагерный Сад» towards Левобережный. Trips there:
 * … 12:15, 12:55 (Интернационалистов 12:25, пл. Ленина 12:40, Левитана 12:58), 13:35, …
 */
const schedule = schedule2026 as unknown as ISchedule
const WEDNESDAY = 3
const STOP = `Лагерный Сад`

let id = 0
const mark = (stop: string, type: string, at: string, wasOnTime: 0 | 1 | null = null): ReturnType<typeof matchReport> =>
	matchReport(
		{ id: ++id, stop, direction: DirectionsNew.inLB, type, date: `2026-09-30 ${at}:00`, was_on_time: wasOnTime },
		schedule,
		WEDNESDAY,
	)

const insights = (
	now: string,
	reports: ReturnType<typeof mark>[],
	stats: DelayStat[] = [],
): ReturnType<typeof buildStopInsights> =>
	buildStopInsights({
		reports,
		stats,
		schedule,
		dayKey: WEDNESDAY,
		stop: STOP,
		direction: DirectionsNew.inLB,
		now: toMinutes(now),
		nextTripTime: `12:55`,
	})

const feed = (i: ReturnType<typeof insights>): string[] =>
	i.feed.map(f => `${f.scheduledTime} ${f.status} ${fromMinutes(f.at)}`)
const live = (i: ReturnType<typeof insights>): string[] =>
	i.live.map(l => `${l.trip.time} ${l.atLeast ? `≥` : ``}${l.delay} from ${l.fromStop}`)

describe(`«не приехал» — это только «человек не видел автобус»`, () => {
	it(`одиночная отметка — только факт, без выводов`, () => {
		const i = insights(`12:26`, [mark(STOP, `not_arrive`, `12:25`)])

		expect(feed(i)).toEqual([`12:15 notYet 12:25`])
		expect(i.live).toEqual([])
	})

	it(`ниже по маршруту его видели раньше — значит, прошёл до этого человека`, () => {
		const i = insights(`12:26`, [mark(STOP, `not_arrive`, `12:25`), mark(`Левитана`, `arrived`, `12:15`)])

		expect(feed(i)).toEqual([`12:15 passedBefore 12:12`])
	})

	it(`потом здесь отметили «Приехал» — одна строка: пришёл`, () => {
		const i = insights(`12:32`, [mark(STOP, `not_arrive`, `12:25`), mark(STOP, `arrived`, `12:31`)])

		expect(feed(i)).toEqual([`12:15 arrived 12:31`])
	})

	it(`выше по маршруту +8, здесь позже «не приехал» — опаздывает на 8`, () => {
		const i = insights(`13:00`, [mark(`Интернационалистов`, `arrived`, `12:33`), mark(STOP, `not_arrive`, `12:59`)])

		expect(live(i)).toEqual([`12:55 8 from ${STOP}`])
	})

	it(`человек ответил «был вовремя» — опаздывает минимум на столько, сколько он ждёт`, () => {
		expect(live(insights(`13:02`, [mark(STOP, `not_arrive`, `13:01`, 1)]))).toEqual([`12:55 ≥6 from ${STOP}`])
	})

	it(`человек ответил «подошёл позже» — выводов нет`, () => {
		expect(insights(`13:02`, [mark(STOP, `not_arrive`, `13:01`, 0)]).live).toEqual([])
	})

	it(`рейс нигде не видели, а следующий уже пришёл — не пришёл`, () => {
		const i = insights(`12:58`, [mark(STOP, `not_arrive`, `12:30`), mark(STOP, `arrived`, `12:57`)])

		expect(feed(i)).toEqual([`12:55 arrived 12:57`, `12:15 cancelled 12:30`])
	})
})

describe(`побеждает самая свежая отметка о том же автобусе`, () => {
	const usualLate: DelayStat[] = [
		{ stop: STOP, direction: `inLB`, scheduledTime: `12:55`, median: 6, p25: 5, p75: 7, count: 4, days: 4 },
	]

	it(`старая +8, свежая −3 — придёт раньше`, () => {
		const i = insights(
			`12:47`,
			[mark(`Интернационалистов`, `arrived`, `12:33`), mark(`пл. Ленина`, `arrived`, `12:37`)],
			usualLate,
		)

		expect(live(i)).toEqual([`12:55 -3 from пл. Ленина`])
	})

	it(`свежая «вовремя» — есть сигнал, «обычно опаздывает» его не перебивает`, () => {
		const i = insights(`12:47`, [mark(`пл. Ленина`, `arrived`, `12:40`)], usualLate)

		expect(live(i)).toEqual([`12:55 0 from пл. Ленина`])
	})

	it(`свежих отметок нет — «обычно» из истории`, () => {
		expect(insights(`12:47`, [], usualLate).usual).toMatchObject({ median: 6, scope: `trip` })
	})
})
