import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { showBusDirectionSelector, showLiveBusSelector } from 'features/Settings/model/settingsSlice'
import * as maplibregl from 'maplibre-gl'
import { LiveBusPosition, useGetFeaturesQuery, useGetLiveQuery } from 'shared/api/scheduleApi'
import { setLiveTracking } from 'shared/store/app/featureToggleSlice'
import { liveTrackingEnabledSelector } from 'shared/store/app/selectors/liveTracking'

import { BUS_ICON_SVG } from '../assets/busIcon'
import { ARROW_SVG } from '../assets/directionIcons'
import { TMap } from '../TMap'
import styles from './liveBus.module.css'

const LERP_SPEED = 2.5 // exponential lerp speed (units/sec)
/** Выше пинов остановок (выбранный пин — 10), иначе автобус у остановки прячется под пином */
const BUS_Z_INDEX = `20`
const BUS_ICON_URL = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(BUS_ICON_SVG)}`

const DIRECTION_LABEL = { out: `в город`, inLB: `из города` } as const
/** Направление ещё не определено — подпись всё равно есть, чтобы было видно, что фича работает */
const UNKNOWN_DIRECTION_LABEL = `направление неясно`

interface BusState {
	id?: string
	curLng: number
	curLat: number
	tgtLng: number
	tgtLat: number
	curBearing: number | null
	tgtBearing: number | null
	marker: maplibregl.Marker
	arrow: HTMLElement
	label: HTMLElement
	/** Последний поворот стрелки на экране — чтобы не трогать DOM каждый кадр */
	shownRotation: number | null
}

/** Поворот по кратчайшей дуге: 350° → 10° — это +20°, а не −340° */
function angleDelta(from: number, to: number): number {
	return ((((to - from) % 360) + 540) % 360) - 180
}

function createBus(map: maplibregl.Map, bus: LiveBusPosition): BusState {
	const root = document.createElement(`div`)
	root.className = styles.marker
	root.innerHTML =
		`<div class="${styles.bus}">` +
		`<div class="${styles.pulse}"></div>` +
		`<div class="${styles.arrow}" hidden>${ARROW_SVG}</div>` +
		`<img class="${styles.icon}" src="${BUS_ICON_URL}" alt="">` +
		`<div class="${styles.label}" hidden></div>` +
		`</div>`

	const marker = new maplibregl.Marker({ element: root, anchor: `center` }).setLngLat([bus.lng, bus.lat]).addTo(map)
	// Маркер сам выставляет стили элементу — z-index ставим после addTo
	root.style.zIndex = BUS_Z_INDEX

	const bearing = bus.bearing ?? null

	return {
		id: bus.id,
		curLng: bus.lng,
		curLat: bus.lat,
		tgtLng: bus.lng,
		tgtLat: bus.lat,
		curBearing: bearing,
		tgtBearing: bearing,
		marker,
		arrow: root.querySelector(`.${styles.arrow}`) as HTMLElement,
		label: root.querySelector(`.${styles.label}`) as HTMLElement,
		shownRotation: null,
	}
}

/** Стрелка и подпись — только под тоглом «Направление автобуса» */
function renderDirection(s: BusState, bus: LiveBusPosition, showDirection: boolean): void {
	s.label.hidden = !showDirection
	if (showDirection) s.label.textContent = bus.direction ? DIRECTION_LABEL[bus.direction] : UNKNOWN_DIRECTION_LABEL

	const showArrow = showDirection && s.curBearing !== null
	if (!showArrow) s.shownRotation = null
	s.arrow.hidden = !showArrow
}

export const LiveBusLayer: React.FC<{ map: TMap }> = ({ map }) => {
	const dispatch = useDispatch()
	const liveTrackingEnabled = useSelector(liveTrackingEnabledSelector)
	const showLiveBus = useSelector(showLiveBusSelector)
	// Бета: тогл «Направление автобуса» в настройках, по умолчанию выключен
	const showDirection = useSelector(showBusDirectionSelector)
	const shouldPoll = liveTrackingEnabled && showLiveBus

	const busStatesRef = useRef<BusState[]>([])

	const { data: features } = useGetFeaturesQuery()

	useEffect(() => {
		if (features) dispatch(setLiveTracking(Boolean(features.liveTracking)))
	}, [features, dispatch])

	const { data: liveData } = useGetLiveQuery(undefined, {
		pollingInterval: 15_000,
		skip: !shouldPoll,
	})

	// Animation loop: lerp positions and arrow rotation. Маркеры не ждут загрузки стиля
	// и тайлов, поэтому цикл живёт с картой; новая карта (кнопка «повторить») — новые маркеры.
	useEffect(() => {
		if (!map) return undefined

		let frame = 0
		let lastFrameTime = 0

		const tick = (now: number): void => {
			const dt = lastFrameTime ? Math.min((now - lastFrameTime) / 1000, 0.1) : 0
			lastFrameTime = now
			const alpha = 1 - Math.exp(-LERP_SPEED * dt)
			const mapBearing = map.getBearing()

			for (const s of busStatesRef.current) {
				const newLng = s.curLng + (s.tgtLng - s.curLng) * alpha
				const newLat = s.curLat + (s.tgtLat - s.curLat) * alpha

				if (Math.abs(newLng - s.curLng) > 1e-8 || Math.abs(newLat - s.curLat) > 1e-8) {
					s.curLng = newLng
					s.curLat = newLat
					s.marker.setLngLat([newLng, newLat])
				}

				if (s.curBearing !== null && s.tgtBearing !== null) {
					s.curBearing = (s.curBearing + angleDelta(s.curBearing, s.tgtBearing) * alpha + 360) % 360
				}

				// Стрелка в координатах экрана: курс минус поворот карты
				if (!s.arrow.hidden && s.curBearing !== null) {
					const rotation = s.curBearing - mapBearing
					if (s.shownRotation === null || Math.abs(angleDelta(s.shownRotation, rotation)) > 0.5) {
						s.arrow.style.transform = `rotate(${rotation}deg)`
						s.shownRotation = rotation
					}
				}
			}

			frame = requestAnimationFrame(tick)
		}

		frame = requestAnimationFrame(tick)

		return () => {
			cancelAnimationFrame(frame)
			busStatesRef.current.forEach(s => s.marker.remove())
			busStatesRef.current = []
		}
	}, [map])

	// Sync incoming bus data into markers
	useEffect(() => {
		if (!map) return

		const incoming = shouldPoll ? liveData?.buses ?? [] : []
		const prev = busStatesRef.current
		// С тоглом направления сопоставляем по id: перевозчик может переставить автобусы в ответе.
		// Без тогла (или со старым бэком без id) — по индексу, как раньше.
		const prevById = new Map(prev.map(s => [s.id, s]))
		const kept = new Set<BusState>()

		busStatesRef.current = incoming.map((bus, i) => {
			const candidate = showDirection && bus.id !== undefined ? prevById.get(bus.id) : prev[i]
			const existing = candidate && !kept.has(candidate) ? candidate : undefined
			const bearing = bus.bearing ?? null
			let state: BusState

			if (existing) {
				// Update target, keep current animated position for smooth lerp
				existing.id = bus.id
				existing.tgtLng = bus.lng
				existing.tgtLat = bus.lat
				existing.tgtBearing = bearing
				// Стрелка появилась или пропала — без анимации поворота от прошлого значения
				if (existing.curBearing === null || bearing === null) existing.curBearing = bearing
				state = existing
			} else {
				// New bus: start at target position (no lerp on first appearance)
				state = createBus(map, bus)
			}

			renderDirection(state, bus, showDirection)
			kept.add(state)

			return state
		})

		prev.filter(s => !kept.has(s)).forEach(s => s.marker.remove())
	}, [liveData, shouldPoll, showDirection, map])

	return null
}
