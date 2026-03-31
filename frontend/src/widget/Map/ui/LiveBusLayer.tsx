import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import * as maptilersdk from '@maptiler/sdk'
import { showLiveBusSelector } from 'features/Settings/model/settingsSlice'
import { useGetFeaturesQuery, useGetLiveQuery } from 'shared/api/scheduleApi'
import { setLiveTracking } from 'shared/store/app/featureToggleSlice'
import { liveTrackingEnabledSelector } from 'shared/store/app/selectors/liveTracking'

import { BUS_ICON_ID, loadBusImage } from '../assets/busIcon'
import { TMap } from '../TMap'

const SOURCE_ID = `livebus-source`
const LAYER_PULSE = `livebus-pulse`
const LAYER_ICON = `livebus-icon`
const PULSE_PERIOD = 2000 // ms per cycle
const LERP_SPEED = 2.5 // exponential lerp speed (units/sec)

const EMPTY_GEOJSON: GeoJSON.FeatureCollection = { type: `FeatureCollection`, features: [] }

interface BusState {
	curLng: number
	curLat: number
	tgtLng: number
	tgtLat: number
	description: string
}

function buildGeoJSON(states: BusState[]): GeoJSON.FeatureCollection {
	return {
		type: `FeatureCollection`,
		features: states.map((s, i) => ({
			type: `Feature`,
			id: i,
			properties: { description: s.description },
			geometry: { type: `Point`, coordinates: [s.curLng, s.curLat] },
		})),
	}
}

function hasLayer(map: maptilersdk.Map, id: string): boolean {
	return Boolean(map.getLayer(id))
}

function hasSource(map: maptilersdk.Map, id: string): boolean {
	return Boolean(map.getSource(id))
}

function addLayers(map: maptilersdk.Map): void {
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
}

/** Pulse opacity: fade-in for first 15% of cycle, then fade out — no visible restart */
function pulseOpacity(t: number): number {
	return t < 0.15 ? (t / 0.15) * 0.45 : (0.45 * (1 - t)) / 0.85
}

function removeLayers(map: maptilersdk.Map): void {
	try {
		if (hasLayer(map, LAYER_ICON)) map.removeLayer(LAYER_ICON)
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
	const shouldPoll = liveTrackingEnabled && showLiveBus

	const animFrameRef = useRef<number | null>(null)
	const layersAddedRef = useRef(false)
	const busStatesRef = useRef<BusState[]>([])
	const lastFrameTimeRef = useRef<number>(0)

	const { data: features } = useGetFeaturesQuery(undefined, { pollingInterval: 60_000 })

	useEffect(() => {
		if (features) dispatch(setLiveTracking(Boolean(features.liveTracking)))
	}, [features, dispatch])

	const { data: liveData } = useGetLiveQuery(undefined, {
		pollingInterval: 15_000,
		skip: !shouldPoll,
	})

	// Main animation loop: lerp positions + pulse
	const startAnimLoop = (animMap: maptilersdk.Map): number => {
		const tick = (now: number): void => {
			const dt = lastFrameTimeRef.current ? Math.min((now - lastFrameTimeRef.current) / 1000, 0.1) : 0
			lastFrameTimeRef.current = now

			// Lerp bus positions
			const states = busStatesRef.current
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
			}

			if (dirty && hasSource(animMap, SOURCE_ID)) {
				const src = animMap.getSource(SOURCE_ID) as maptilersdk.GeoJSONSource | undefined
				src?.setData(buildGeoJSON(states))
			}

			// Pulse: grow from icon edge outward and fade
			// Fade-in first 15% of cycle so restart is invisible (opacity 0→0 at boundaries)
			if (hasLayer(animMap, LAYER_PULSE) && states.length > 0) {
				const t = (now % PULSE_PERIOD) / PULSE_PERIOD
				animMap.setPaintProperty(LAYER_PULSE, `circle-radius`, 22 + t * 18) // 22 → 40
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

		const setup = (): void => {
			void loadBusImage(map).then(activate).catch(activate)
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

		busStatesRef.current = incoming.map((bus, i) => {
			const existing = i < prev.length ? prev[i] : undefined

			if (existing !== undefined) {
				// Update target, keep current animated position for smooth lerp
				existing.tgtLng = bus.lng
				existing.tgtLat = bus.lat
				existing.description = bus.description

				return existing
			}

			// New bus: start at target position (no lerp on first appearance)
			return { curLng: bus.lng, curLat: bus.lat, tgtLng: bus.lng, tgtLat: bus.lat, description: bus.description }
		})

		// If no buses, clear source immediately
		if (incoming.length === 0 && map && layersAddedRef.current) {
			const src = map.getSource(SOURCE_ID) as maptilersdk.GeoJSONSource | undefined
			src?.setData(EMPTY_GEOJSON)
		}
	}, [liveData, shouldPoll, map])

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
