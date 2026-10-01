import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { showBusDirectionSelector, showLiveBusSelector } from 'features/Settings/model/settingsSlice'
import * as maplibregl from 'maplibre-gl'
import { useGetFeaturesQuery, useGetLiveQuery } from 'shared/api/scheduleApi'
import { setLiveTracking } from 'shared/store/app/featureToggleSlice'
import { liveTrackingEnabledSelector } from 'shared/store/app/selectors/liveTracking'

import { BUS_ICON_ID, loadBusImage } from '../assets/busIcon'
import { ARROW_ICON_ID, DIRECTION_LABEL_ICON_ID, loadDirectionImages } from '../assets/directionIcons'
import { TMap } from '../TMap'

const SOURCE_ID = `livebus-source`
const LAYER_PULSE = `livebus-pulse`
const LAYER_ICON = `livebus-icon`
const LAYER_ARROW = `livebus-arrow`
const LAYER_DIRECTION = `livebus-direction`
const PULSE_PERIOD = 2000 // ms per cycle
const LERP_SPEED = 2.5 // exponential lerp speed (units/sec)

const EMPTY_GEOJSON: GeoJSON.FeatureCollection = { type: `FeatureCollection`, features: [] }

interface BusState {
	id?: string
	curLng: number
	curLat: number
	tgtLng: number
	tgtLat: number
	description: string
	curBearing: number | null
	tgtBearing: number | null
	direction: 'out' | 'inLB' | null
}

/** Свойства направления кладём, только когда включён тогл — иначе слои стрелки и подписи пусты */
function buildGeoJSON(states: BusState[], withDirection: boolean): GeoJSON.FeatureCollection {
	return {
		type: `FeatureCollection`,
		features: states.map((s, i) => {
			const properties: Record<string, string | number> = { description: s.description }

			if (withDirection && s.curBearing !== null) properties.bearing = s.curBearing
			if (withDirection && s.direction) properties.directionIcon = DIRECTION_LABEL_ICON_ID[s.direction]

			return {
				type: `Feature`,
				id: i,
				properties,
				geometry: { type: `Point`, coordinates: [s.curLng, s.curLat] },
			}
		}),
	}
}

/** Поворот по кратчайшей дуге: 350° → 10° — это +20°, а не −340° */
function angleDelta(from: number, to: number): number {
	return ((((to - from) % 360) + 540) % 360) - 180
}

function hasLayer(map: maplibregl.Map, id: string): boolean {
	return Boolean(map.getLayer(id))
}

function hasSource(map: maplibregl.Map, id: string): boolean {
	return Boolean(map.getSource(id))
}

function addLayers(map: maplibregl.Map): void {
	if (!hasSource(map, SOURCE_ID)) {
		map.addSource(SOURCE_ID, { type: `geojson`, data: EMPTY_GEOJSON })
	}

	// Pulse circle — starts outside the icon edge (~22px) and grows outward
	if (!hasLayer(map, LAYER_PULSE)) {
		map.addLayer({
			id: LAYER_PULSE,
			type: `circle`,
			source: SOURCE_ID,
			paint: {
				'circle-radius': 22,
				'circle-color': `#FF6B35`,
				'circle-opacity': 0,
				'circle-stroke-width': 0,
				'circle-pitch-alignment': `viewport`,
			},
		})
	}

	// Стрелка курса — под иконкой автобуса, поворачивается вместе с картой
	if (!hasLayer(map, LAYER_ARROW)) {
		map.addLayer({
			id: LAYER_ARROW,
			type: `symbol`,
			source: SOURCE_ID,
			filter: [`has`, `bearing`],
			layout: {
				'icon-image': ARROW_ICON_ID,
				'icon-rotate': [`get`, `bearing`],
				'icon-rotation-alignment': `map`,
				'icon-allow-overlap': true,
				'icon-ignore-placement': true,
			},
		})
	}

	// Bus icon symbol layer
	if (!hasLayer(map, LAYER_ICON)) {
		map.addLayer({
			id: LAYER_ICON,
			type: `symbol`,
			source: SOURCE_ID,
			layout: {
				'icon-image': BUS_ICON_ID,
				'icon-size': 1,
				'icon-allow-overlap': true,
				'icon-ignore-placement': true,
			},
		})
	}

	// Подпись «в город» / «из города» под автобусом
	if (!hasLayer(map, LAYER_DIRECTION)) {
		map.addLayer({
			id: LAYER_DIRECTION,
			type: `symbol`,
			source: SOURCE_ID,
			filter: [`has`, `directionIcon`],
			layout: {
				'icon-image': [`get`, `directionIcon`],
				'icon-anchor': `top`,
				'icon-offset': [0, 22],
				'icon-allow-overlap': true,
				'icon-ignore-placement': true,
			},
		})
	}
}

/** Pulse opacity: fade-in for first 15% of cycle, then fade out — no visible restart */
function pulseOpacity(t: number): number {
	return t < 0.15 ? (t / 0.15) * 0.45 : (0.45 * (1 - t)) / 0.85
}

function removeLayers(map: maplibregl.Map): void {
	try {
		if (hasLayer(map, LAYER_DIRECTION)) map.removeLayer(LAYER_DIRECTION)
		if (hasLayer(map, LAYER_ICON)) map.removeLayer(LAYER_ICON)
		if (hasLayer(map, LAYER_ARROW)) map.removeLayer(LAYER_ARROW)
		if (hasLayer(map, LAYER_PULSE)) map.removeLayer(LAYER_PULSE)
		if (hasSource(map, SOURCE_ID)) map.removeSource(SOURCE_ID)
	} catch {
		// map already destroyed
	}
}

export const LiveBusLayer: React.FC<{ map: TMap }> = ({ map }) => {
	const dispatch = useDispatch()
	const liveTrackingEnabled = useSelector(liveTrackingEnabledSelector)
	const showLiveBus = useSelector(showLiveBusSelector)
	const showBusDirection = useSelector(showBusDirectionSelector)
	const shouldPoll = liveTrackingEnabled && showLiveBus

	const animFrameRef = useRef<number | null>(null)
	const layersAddedRef = useRef(false)
	const busStatesRef = useRef<BusState[]>([])
	const lastFrameTimeRef = useRef<number>(0)

	const { data: features } = useGetFeaturesQuery()
	// Бета: бэкенд-флаг liveDirection + тогл «Направление автобуса» в настройках
	const showDirection = features?.liveDirection === true && showBusDirection
	const showDirectionRef = useRef(showDirection)
	showDirectionRef.current = showDirection

	useEffect(() => {
		if (features) dispatch(setLiveTracking(Boolean(features.liveTracking)))
	}, [features, dispatch])

	const { data: liveData } = useGetLiveQuery(undefined, {
		pollingInterval: 15_000,
		skip: !shouldPoll,
	})

	// Main animation loop: lerp positions + pulse
	const startAnimLoop = (animMap: maplibregl.Map): number => {
		const tick = (now: number): void => {
			const states = busStatesRef.current

			// Skip all work when no buses are present
			if (states.length === 0) {
				lastFrameTimeRef.current = 0
				animFrameRef.current = requestAnimationFrame(tick)

				return
			}

			const dt = lastFrameTimeRef.current ? Math.min((now - lastFrameTimeRef.current) / 1000, 0.1) : 0
			lastFrameTimeRef.current = now

			// Lerp bus positions
			let dirty = false

			for (const s of states) {
				const alpha = 1 - Math.exp(-LERP_SPEED * dt)
				const newLng = s.curLng + (s.tgtLng - s.curLng) * alpha
				const newLat = s.curLat + (s.tgtLat - s.curLat) * alpha

				if (Math.abs(newLng - s.curLng) > 1e-8 || Math.abs(newLat - s.curLat) > 1e-8) {
					s.curLng = newLng
					s.curLat = newLat
					dirty = true
				}

				if (s.curBearing !== null && s.tgtBearing !== null) {
					const delta = angleDelta(s.curBearing, s.tgtBearing)

					if (Math.abs(delta) > 0.1) {
						s.curBearing = (s.curBearing + delta * alpha + 360) % 360
						dirty = true
					}
				}
			}

			if (dirty && hasSource(animMap, SOURCE_ID)) {
				// maplibre 6: setData is async; the next frame supersedes this one, nothing to handle
				;(animMap.getSource(SOURCE_ID) as maplibregl.GeoJSONSource)
					.setData(buildGeoJSON(states, showDirectionRef.current))
					.catch(() => undefined)
			}

			// Pulse: grow from icon edge outward and fade
			if (hasLayer(animMap, LAYER_PULSE)) {
				const t = (now % PULSE_PERIOD) / PULSE_PERIOD
				animMap.setPaintProperty(LAYER_PULSE, `circle-radius`, 22 + t * 18)
				animMap.setPaintProperty(LAYER_PULSE, `circle-opacity`, pulseOpacity(t))
			}

			animFrameRef.current = requestAnimationFrame(tick)
		}

		return requestAnimationFrame(tick)
	}

	// Setup layers once map is ready
	useEffect(() => {
		if (!map || layersAddedRef.current) return

		const activate = (): void => {
			addLayers(map)
			layersAddedRef.current = true
			animFrameRef.current = startAnimLoop(map)
		}

		// Картинки направления не критичны: не загрузились — автобус всё равно рисуется
		const setup = (): void => {
			void Promise.all([
				loadBusImage(map).catch(() => undefined),
				loadDirectionImages(map).catch(() => undefined),
			]).then(activate)
		}

		if (map.isStyleLoaded()) {
			setup()
		} else {
			void map.once(`load`, setup)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [map])

	// Sync incoming bus data into busStatesRef
	useEffect(() => {
		const incoming = shouldPoll ? liveData?.buses ?? [] : []

		const prev = busStatesRef.current
		// С тоглом направления сопоставляем по id: перевозчик может переставить автобусы в ответе.
		// Без тогла (или со старым бэком без id) — по индексу, как раньше.
		const prevById = new Map(prev.map(s => [s.id, s]))

		busStatesRef.current = incoming.map((bus, i) => {
			const existing =
				showDirection && bus.id !== undefined ? prevById.get(bus.id) : i < prev.length ? prev[i] : undefined
			const bearing = bus.bearing ?? null

			if (existing !== undefined) {
				// Update target, keep current animated position for smooth lerp
				existing.id = bus.id
				existing.tgtLng = bus.lng
				existing.tgtLat = bus.lat
				existing.description = bus.description
				existing.direction = bus.direction ?? null
				existing.tgtBearing = bearing
				// Стрелка появилась или пропала — без анимации поворота от прошлого значения
				if (existing.curBearing === null || bearing === null) existing.curBearing = bearing

				return existing
			}

			// New bus: start at target position (no lerp on first appearance)
			return {
				id: bus.id,
				curLng: bus.lng,
				curLat: bus.lat,
				tgtLng: bus.lng,
				tgtLat: bus.lat,
				description: bus.description,
				curBearing: bearing,
				tgtBearing: bearing,
				direction: bus.direction ?? null,
			}
		})

		// Immediately update GeoJSON so new buses appear without waiting for lerp
		if (map && layersAddedRef.current) {
			;(map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource)
				.setData(incoming.length > 0 ? buildGeoJSON(busStatesRef.current, showDirection) : EMPTY_GEOJSON)
				.catch(() => undefined)
		}
	}, [liveData, shouldPoll, showDirection, map])

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
			if (map) removeLayers(map)
			layersAddedRef.current = false
			busStatesRef.current = []
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return null
}
