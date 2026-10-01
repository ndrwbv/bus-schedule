#!/usr/bin/env node
/**
 * Собирает линию маршрута 112С для определения направления live-автобуса
 * (specs/14-live-bus-direction.md) → backend/src/data/route-112s.json.
 *
 * Плечи:
 *   out  («в город»)   — OSM relation 16313536 целиком: Серебряный бор → Интернационалистов.
 *   inLB («из города») — OSM relation 16313537 до Лагерного Сада, дальше через Левобережный
 *                        по дорогам OSRM. В OSM (2023) обратный рейс ещё идёт через Набережную,
 *                        а с сентября 2026 все рейсы «из города» идут через Левитана … Три элемента.
 *
 * Запуск: node scripts/build-route-112s.mjs
 * Перезапускать, когда перевозчик меняет трассу маршрута.
 */
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const OUT_FILE = join(dirname(fileURLToPath(import.meta.url)), '../backend/src/data/route-112s.json')
const OSM_OUT = 16313536
const OSM_IN = 16313537
const UA = 'severbus.ru route builder'

/** Лагерный Сад в плече «из города» — здесь OSM-трасса обрывается и начинается OSRM */
const LAGERNY_SAD_IN = [56.4551773, 84.9507183]
/** Лагерный Сад → Левитана → Синее небо → Этюд → Гармония → Три элемента → Серебряный бор */
const LB_WAYPOINTS = [
	LAGERNY_SAD_IN,
	[56.446951, 84.921565],
	[56.445827, 84.917034],
	[56.441423, 84.916935],
	[56.441418, 84.919334],
	[56.444195, 84.919244],
	[56.4594751, 84.9058944],
]

const SIMPLIFY_M = 5

async function osmRelationLine(id) {
	const res = await fetch(`https://api.openstreetmap.org/api/0.6/relation/${id}/full.json`, {
		headers: { 'User-Agent': UA },
	})
	if (!res.ok) throw new Error(`OSM ${id}: HTTP ${res.status}`)
	const { elements } = await res.json()
	const nodes = new Map(elements.filter(e => e.type === 'node').map(e => [e.id, [e.lat, e.lon]]))
	const ways = new Map(elements.filter(e => e.type === 'way').map(e => [e.id, e.nodes]))
	const rel = elements.find(e => e.type === 'relation' && e.id === id)
	const members = rel.members.filter(m => m.type === 'way' && m.role === '').map(m => ways.get(m.ref))

	// Склеиваем пути по порядку, разворачивая каждый так, чтобы он продолжал предыдущий
	let chain = [...members[0]]
	for (let i = 1; i < members.length; i++) {
		const w = members[i]
		const last = chain[chain.length - 1]
		if (w[0] === last) chain.push(...w.slice(1))
		else if (w[w.length - 1] === last) chain.push(...[...w].reverse().slice(1))
		else if (i === 1 && (w[0] === chain[0] || w[w.length - 1] === chain[0])) {
			chain.reverse()
			i--
		} else {
			// В 16313536 после конечной лежат лишние пути у Маяка — ошибка разметки в OSM
			console.warn(`  relation ${id}: путь #${i} не продолжает трассу, пропускаю`)
		}
	}
	return chain.map(n => nodes.get(n))
}

async function osrmLine(points) {
	const coords = points.map(([lat, lng]) => `${lng},${lat}`).join(';')
	const res = await fetch(
		`https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`,
		{ headers: { 'User-Agent': UA } },
	)
	if (!res.ok) throw new Error(`OSRM: HTTP ${res.status}`)
	const data = await res.json()
	return data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng])
}

const toXY = ([lat, lng]) => [lng * Math.cos((56.47 * Math.PI) / 180) * 111320, lat * 110540]
const dist = (a, b) => Math.hypot(toXY(a)[0] - toXY(b)[0], toXY(a)[1] - toXY(b)[1])

function segDist(p, a, b) {
	const [px, py] = toXY(p)
	const [ax, ay] = toXY(a)
	const [bx, by] = toXY(b)
	const dx = bx - ax
	const dy = by - ay
	const len2 = dx * dx + dy * dy
	const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2))
	return Math.hypot(px - (ax + t * dx), py - (ay + t * dy))
}

function simplify(points) {
	if (points.length < 3) return points
	let maxD = 0
	let idx = 0
	for (let i = 1; i < points.length - 1; i++) {
		const d = segDist(points[i], points[0], points[points.length - 1])
		if (d > maxD) {
			maxD = d
			idx = i
		}
	}
	if (maxD <= SIMPLIFY_M) return [points[0], points[points.length - 1]]
	return [...simplify(points.slice(0, idx + 1)).slice(0, -1), ...simplify(points.slice(idx))]
}

function nearestIndex(line, p) {
	let best = 0
	for (let i = 1; i < line.length; i++) if (dist(line[i], p) < dist(line[best], p)) best = i
	return best
}

const lengthM = line => line.slice(1).reduce((s, p, i) => s + dist(line[i], p), 0)
const round = line => line.map(([lat, lng]) => [+lat.toFixed(6), +lng.toFixed(6)])

const out = await osmRelationLine(OSM_OUT)
const inOsm = await osmRelationLine(OSM_IN)
const inCity = inOsm.slice(0, nearestIndex(inOsm, LAGERNY_SAD_IN) + 1)
const inLb = await osrmLine(LB_WAYPOINTS)
const inLB = [...inCity, ...inLb.slice(1)]

const legs = { out: round(simplify(out)), inLB: round(simplify(inLB)) }
for (const [name, line] of Object.entries(legs)) {
	console.log(`${name}: ${line.length} точек, ${(lengthM(line) / 1000).toFixed(1)} км`)
}

writeFileSync(
	OUT_FILE,
	`${JSON.stringify(
		{
			source: `OSM relations ${OSM_OUT} (out), ${OSM_IN} (inLB до Лагерного Сада) + OSRM через Левобережный`,
			generatedAt: new Date().toISOString().slice(0, 10),
			legs,
		},
		null,
		0,
	)}\n`,
)
console.log(`→ ${OUT_FILE}`)
