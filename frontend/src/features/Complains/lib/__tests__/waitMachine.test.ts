import { DirectionsNew, TaggedTime } from 'shared/store/busStop/Stops'
import { describe, expect, it } from 'vitest'

import { WaitState } from '../../model/waitState'
import { fromMinutes, toMinutes } from '../matchReports'
import {
	applyWaitAnswer,
	arrivedAgoOptions,
	Coords,
	decideWaitCheck,
	toWaitTrip,
	WaitAnswer,
	WaitOutcome,
	WaitStep,
	WaitStop,
} from '../waitMachine'

/**
 * «Опрос на остановке», played minute by minute the way useWaitCheck drives it: every minute
 * `decideWaitCheck` says whether to ask, a scripted passenger answers, `applyWaitAnswer` says
 * what that means. Each scenario reads as a log of questions (?), answers (→), marks sent (!)
 * and silent moves (·).
 */

const STOP: WaitStop = { id: `24`, label: `Лагерный Сад`, direction: DirectionsNew.inLB, directionText: null }
const STOP_LAT_LON: Coords = [56.45532, 84.950723]
/** ~300 m from the stop — walked away */
const AWAY: Coords = [56.4581, 84.9507]
/** ~1.3 km — at home */
const HOME: Coords = [56.467, 84.95]

const trip = (time: string, tripIndex = 11): TaggedTime => ({
	time,
	via: null,
	direction: DirectionsNew.inLB,
	dayKey: 3,
	tripIndex,
})

interface Env {
	/** The trip a passenger at this stop would mean right now */
	target?: (now: number) => TaggedTime | null
	/** The next trip after the one waited for */
	next?: TaggedTime
	/** When passengers upstream say the bus will be here */
	live?: (now: number) => number | null
	/** Other passengers' «Приехал» about the trip waited for (`trip` — which one) */
	seen?: (
		now: number,
		trip: string | undefined,
	) => { hereAt: number | null; downstream: { stop: string; at: number } | null }
	coords?: (now: number) => Coords | null
}

type Reply = (step: WaitStep, now: number) => WaitAnswer
/** By step kind, or by «HH:MM kind» for one particular moment */
type Script = Partial<Record<string, Reply>>

const describeStep = (step: WaitStep, wait: WaitState | null, now: number): string => {
	switch (step.kind) {
		case `presence`:
			return `? presence ${step.trip.time}${step.overdue ? ` overdue` : ``}`
		case `bus`: {
			if (step.left) return `? left`
			const hint =
				step.hint &&
				(step.hint.kind === `here`
					? ` here ${fromMinutes(step.hint.at)}`
					: ` downstream ${step.hint.stop} ${fromMinutes(step.hint.at)}`)

			return `? bus ${wait?.trip.time ?? ``}${hint ?? ``}`
		}
		case `when`:
			return `? when ${wait ? arrivedAgoOptions(wait, now).join(`,`) : ``}`
		case `info`:
			return `i ${step.title}`
		default:
			return `? ${step.kind}`
	}
}

const describeAnswer = (a: WaitAnswer): string => {
	if (a.kind === `arrivedAt`) return `→ at ${fromMinutes(a.at)}`
	if (a.kind === `left`) return `→ ${a.boarded ? `boarded` : `walked`}`
	if (a.kind === `onTime`) return `→ ${a.onTime ? `onTime` : `cameLater`}`

	return `→ ${a.answer}`
}

const describeMarks = (out: WaitOutcome): string[] =>
	out.marks.map(mark => {
		const onTime = mark.wasOnTime === undefined ? `` : mark.wasOnTime ? ` on_time` : ` came_later`

		return `! ${mark.type} ${mark.trip.time}${mark.arrivedAt ? ` at ${mark.arrivedAt}` : ``}${onTime}`
	})

const play = ({
	from,
	to,
	env = {},
	script = {},
	wait: initial = null,
}: {
	from: string
	to: string
	env?: Env
	script?: Script
	wait?: WaitState | null
}): { log: string[]; wait: WaitState | null } => {
	const log: string[] = []
	let wait = initial
	let step: WaitStep | null = null
	let dismissed = false
	const done = new Set<string>()
	const nextTrip = env.next ? toWaitTrip(env.next) : null
	const input = (now: number, answer: WaitAnswer, of: WaitStep): WaitOutcome =>
		applyWaitAnswer({
			answer,
			step: of,
			wait,
			stop: STOP,
			nextTrip,
			now,
			day: `d`,
			coords: env.coords?.(now) ?? null,
		})

	for (let now = toMinutes(from); now <= toMinutes(to); now++) {
		const at = fromMinutes(now)
		const target = env.target?.(now) ?? null

		if (!step) {
			const action = decideWaitCheck({
				now,
				wait,
				coords: env.coords?.(now) ?? null,
				liveExpected: env.live?.(now) ?? null,
				seen: env.seen?.(now, wait?.trip.time) ?? { hereAt: null, downstream: null },
				stopLatLon: STOP_LAT_LON,
				target: target && !done.has(target.time) ? target : null,
				// The stop has been open for 90 s by the second minute
				mayAskPresence: !dismissed && now - toMinutes(from) >= 2,
			})
			// eslint-disable-next-line no-continue
			if (!action) continue

			if (action.kind === `drop`) {
				log.push(`${at} · drop`)
				wait = null
				// eslint-disable-next-line no-continue
				continue
			}
			if (action.kind === `start` && target) {
				wait = input(
					now,
					{ kind: `presence`, answer: `justCame` },
					{ kind: `presence`, trip: target, overdue: false },
				).wait
				log.push(`${at} · start ${target.time}, ask at ${fromMinutes(wait?.askAt ?? 0)}`)
				// eslint-disable-next-line no-continue
				continue
			}
			if (action.kind === `rollover` && wait) {
				const out = input(now, { kind: `bus`, answer: `passedBy` }, { kind: `bus`, left: false, hint: null })
				if (out.doneTrip) done.add(out.doneTrip)
				wait = out.wait
				log.push(
					`${at} i passed before them at ${fromMinutes(action.seenAt)}, next ${wait?.trip.time ?? `none`}`,
				)
				// eslint-disable-next-line no-continue
				continue
			}
			if (action.kind === `ask`) step = action.step
		}
		if (!step) continue // eslint-disable-line no-continue

		log.push(`${at} ${describeStep(step, wait, now)}`)
		const reply = script[`${at} ${step.kind}`] ?? script[step.kind]
		if (!reply) break

		const answer = reply(step, now)
		const out = input(now, answer, step)
		log.push(`${at} ${describeAnswer(answer)}`, ...describeMarks(out).map(m => `${at} ${m}`))
		if (out.dismiss) dismissed = true
		if (out.doneTrip) done.add(out.doneTrip)
		wait = out.wait
		// «Спасибо» closes by itself; a follow-up question («Когда?») comes in the same minute
		step = out.step?.kind === `thanks` ? null : out.step
		if (step) now--
	}

	return { log, wait }
}

const due1335 = (now: number): TaggedTime | null =>
	now >= toMinutes(`13:20`) && now <= toMinutes(`13:50`) ? trip(`13:35`) : null
const yes: Script = { presence: () => ({ kind: `presence`, answer: `justCame` }) }
const arrivedNow: Script = {
	bus: () => ({ kind: `bus`, answer: `arrived` }),
	when: (_s, now) => ({ kind: `arrivedAt`, at: now }),
}

describe(`опрос на остановке`, () => {
	it(`1. ждёт, автобус вовремя: «Вы на остановке?» → через 2 мин после расписания «Пришёл?»`, () => {
		expect(
			play({ from: `13:28`, to: `13:45`, env: { target: due1335 }, script: { ...yes, ...arrivedNow } }).log,
		).toEqual([
			`13:30 ? presence 13:35`,
			`13:30 → justCame`,
			`13:37 ? bus 13:35`,
			`13:37 → arrived`,
			`13:37 ? when 2,5`,
			`13:37 → at 13:37`,
			`13:37 ! arrived 13:35 at 13:37`,
		])
	})

	it(`2. выше по маршруту отметили опоздание — спрашиваем, когда он должен быть здесь на самом деле`, () => {
		const { log } = play({
			from: `13:28`,
			to: `13:50`,
			env: { target: due1335, live: () => toMinutes(`13:43`) },
			script: { ...yes, ...arrivedNow },
		})

		expect(log.find(l => l.includes(`? bus`))).toBe(`13:45 ? bus 13:35`)
	})

	it(`3. «ещё нет» дважды: повтор через 4 мин, «когда» — только после последнего «ещё нет»`, () => {
		expect(
			play({
				from: `13:28`,
				to: `13:55`,
				env: { target: due1335 },
				script: {
					...yes,
					'13:37 bus': () => ({ kind: `bus`, answer: `notYet` }),
					'13:41 bus': () => ({ kind: `bus`, answer: `notYet` }),
					bus: () => ({ kind: `bus`, answer: `arrived` }),
					when: (_s, now) => ({ kind: `arrivedAt`, at: now - 2 }),
				},
			}).log,
		).toEqual([
			`13:30 ? presence 13:35`,
			`13:30 → justCame`,
			`13:37 ? bus 13:35`,
			`13:37 → notYet`,
			`13:37 ! not_arrive 13:35 on_time`,
			`13:41 ? bus 13:35`,
			`13:41 → notYet`,
			`13:41 ! not_arrive 13:35 on_time`,
			`13:45 ? bus 13:35`,
			`13:45 → arrived`,
			`13:45 ? when 2`,
			`13:45 → at 13:43`,
			`13:45 ! arrived 13:35 at 13:43`,
		])
	})

	it(`4. сел в автобус до вопроса и вернулся в приложение вечером — молча забываем`, () => {
		const { wait } = play({ from: `13:28`, to: `13:31`, env: { target: due1335 }, script: yes })

		expect(play({ from: `18:00`, to: `18:05`, wait }).log).toEqual([`18:00 · drop`])
	})

	it(`5. вернулся через 20 мин — варианты «когда» на всё время ожидания`, () => {
		const { wait } = play({ from: `13:28`, to: `13:31`, env: { target: due1335 }, script: yes })

		expect(play({ from: `13:57`, to: `13:57`, wait, script: arrivedNow }).log.slice(0, 3)).toEqual([
			`13:57 ? bus 13:35`,
			`13:57 → arrived`,
			`13:57 ? when 2,15,25`,
		])
	})

	it(`6. проехал мимо — ждём следующий рейс`, () => {
		const { log } = play({
			from: `13:28`,
			to: `14:30`,
			env: { target: due1335, next: trip(`14:25`, 12) },
			script: { ...yes, '13:37 bus': () => ({ kind: `bus`, answer: `passedBy` }), ...arrivedNow },
		})

		expect(log).toEqual([
			`13:30 ? presence 13:35`,
			`13:30 → justCame`,
			`13:37 ? bus 13:35`,
			`13:37 → passedBy`,
			`13:37 ! passed_by 13:35`,
			`14:27 ? bus 14:25`,
			`14:27 → arrived`,
			`14:27 ? when 2,15,30`,
			`14:27 → at 14:27`,
			`14:27 ! arrived 14:25 at 14:27`,
		])
	})

	it(`7. подошёл после расписания: два «да»; «только подошёл» — не подтверждённое опоздание`, () => {
		const { log } = play({
			from: `13:39`,
			to: `13:43`,
			env: { target: due1335 },
			script: { ...yes, bus: () => ({ kind: `bus`, answer: `notYet` }) },
		})

		expect(log).toEqual([
			`13:41 ? presence 13:35 overdue`,
			`13:41 → justCame`,
			`13:42 ? bus 13:35`,
			`13:42 → notYet`,
			`13:42 ! not_arrive 13:35 came_later`,
		])
	})

	it(`7b. …«жду с 13:35 или раньше» — «ещё нет» считается настоящим опозданием`, () => {
		const { log } = play({
			from: `13:39`,
			to: `13:43`,
			env: { target: due1335 },
			script: {
				presence: () => ({ kind: `presence`, answer: `sinceScheduled` }),
				bus: () => ({ kind: `bus`, answer: `notYet` }),
			},
		})

		expect(log).toContain(`13:42 ! not_arrive 13:35 on_time`)
	})

	it(`8. рядом отметили «Приехал» — спрашиваем сразу и предлагаем то же время`, () => {
		const { log } = play({
			from: `13:28`,
			to: `13:40`,
			env: {
				target: due1335,
				seen: now => ({ hereAt: now >= toMinutes(`13:36`) ? toMinutes(`13:36`) : null, downstream: null }),
			},
			script: {
				...yes,
				bus: step => ({ kind: `arrivedAt`, at: step.kind === `bus` && step.hint ? step.hint.at : 0 }),
			},
		})

		expect(log.slice(2)).toEqual([
			`13:36 ? bus 13:35 here 13:36`,
			`13:36 → at 13:36`,
			`13:36 ! arrived 13:35 at 13:36`,
		])
	})

	it(`9. автобус здесь прошёл раньше, чем пассажир подошёл — говорим ему и ждём следующий`, () => {
		const { log } = play({
			from: `13:28`,
			to: `14:30`,
			env: {
				target: now => (now < toMinutes(`13:31`) ? trip(`13:35`) : null),
				next: trip(`14:25`, 12),
				seen: (_now, waited) => ({ hereAt: waited === `13:35` ? toMinutes(`13:25`) : null, downstream: null }),
			},
			script: { ...yes, ...arrivedNow },
		})

		expect(log.slice(0, 4)).toEqual([
			`13:30 ? presence 13:35`,
			`13:30 → justCame`,
			`13:31 i passed before them at 13:25, next 14:25`,
			`14:27 ? bus 14:25`,
		])
	})

	it(`10. автобус уже видели дальше по маршруту — спрашиваем сразу`, () => {
		const { log } = play({
			from: `13:28`,
			to: `13:40`,
			env: {
				target: due1335,
				seen: now => ({
					hereAt: null,
					downstream: now >= toMinutes(`13:34`) ? { stop: `Левитана`, at: toMinutes(`13:34`) } : null,
				}),
			},
			script: { ...yes, bus: () => ({ kind: `bus`, answer: `passedBy` }) },
		})

		expect(log.slice(2)).toEqual([
			`13:34 ? bus 13:35 downstream Левитана 13:34`,
			`13:34 → passedBy`,
			`13:34 ! passed_by 13:35`,
		])
	})

	it(`10b. …а пассажир говорит «ещё нет» — подсказка не зацикливает вопрос`, () => {
		const { log } = play({
			from: `13:28`,
			to: `13:48`,
			env: {
				target: due1335,
				seen: now => ({
					hereAt: null,
					downstream: now >= toMinutes(`13:34`) ? { stop: `Левитана`, at: toMinutes(`13:34`) } : null,
				}),
			},
			script: {
				...yes,
				bus: (_s, now) => ({ kind: `bus`, answer: now < toMinutes(`13:44`) ? `notYet` : `arrived` }),
				when: (_s, now) => ({ kind: `arrivedAt`, at: now }),
			},
		})

		expect(log.filter(l => l.includes(`? bus`))).toEqual([
			`13:34 ? bus 13:35 downstream Левитана 13:34`,
			`13:38 ? bus 13:35`,
			`13:42 ? bus 13:35`,
			`13:46 ? bus 13:35`,
		])
	})

	it(`11. геолокация: у остановки — не спрашиваем «Вы на остановке?»; отошёл — «Вы сели?»`, () => {
		const { log } = play({
			from: `13:28`,
			to: `13:40`,
			env: { target: due1335, coords: now => (now < toMinutes(`13:34`) ? STOP_LAT_LON : AWAY) },
			script: { bus: () => ({ kind: `left`, boarded: true }) },
		})

		expect(log).toEqual([
			`13:30 · start 13:35, ask at 13:37`,
			`13:34 ? left`,
			`13:34 → boarded`,
			`13:34 ! arrived 13:35 at 13:33`,
		])
	})

	it(`12. геолокация: дома — не беспокоим`, () => {
		expect(play({ from: `13:28`, to: `13:45`, env: { target: due1335, coords: () => HOME } }).log).toEqual([])
	})

	it(`14. полчаса «ещё нет» — после шестого переходим на следующий рейс`, () => {
		const { log } = play({
			from: `13:28`,
			to: `14:30`,
			env: { target: due1335, next: trip(`14:25`, 12) },
			script: {
				...yes,
				bus: (_s, now) => ({ kind: `bus`, answer: now < toMinutes(`14:00`) ? `notYet` : `arrived` }),
				when: (_s, now) => ({ kind: `arrivedAt`, at: now }),
			},
		})

		expect(log.filter(l => l.includes(`not_arrive`))).toHaveLength(6)
		expect(log.filter(l => l.includes(`? bus`)).map(l => l.slice(0, 5))).toEqual([
			`13:37`,
			`13:41`,
			`13:45`,
			`13:49`,
			`13:53`,
			`13:57`,
			`14:27`,
		])
		expect(log).toContain(`14:27 ! arrived 14:25 at 14:27`)
	})
})
