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
const LAYER_DOT = `livebus-dot`

const EMPTY_GEOJSON: GeoJSON.FeatureCollection = { type: `FeatureCollection`, features: [] }

function buildGeoJSON(buses: { lat: number; lng: number; description: string }[]): GeoJSON.FeatureCollection {
	return {
		type: `FeatureCollection`,
		features: buses.map((bus, i) => ({
			type: `Feature`,
			id: i,
			properties: { description: bus.description },
			geometry: { type: `Point`, coordinates: [bus.lng, bus.lat] },
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

	if (!hasLayer(map, LAYER_PULSE)) {
		map.addLayer({
			id: LAYER_PULSE,
			type: `circle`,
			source: SOURCE_ID,
			paint: { 'circle-radius': 18, 'circle-color': `#FF6B35`, 'circle-opacity': 0.3, 'circle-stroke-width': 0 },
		})
	}

	if (!hasLayer(map, LAYER_DOT)) {
		map.addLayer({
			id: LAYER_DOT,
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

function removeLayers(map: maptilersdk.Map): void {
	try {
		if (hasLayer(map, LAYER_PULSE)) map.removeLayer(LAYER_PULSE)
		if (hasLayer(map, LAYER_DOT)) map.removeLayer(LAYER_DOT)
		if (hasSource(map, SOURCE_ID)) map.removeSource(SOURCE_ID)
	} catch {
		// map already destroyed
	}
}

function startPulse(map: maptilersdk.Map): number {
	let t = 0

	const tick = (): void => {
		t += 0.03
		if (hasLayer(map, LAYER_PULSE)) {
			map.setPaintProperty(LAYER_PULSE, `circle-radius`, 12 + Math.sin(t) * 6)
			map.setPaintProperty(LAYER_PULSE, `circle-opacity`, 0.15 + Math.abs(Math.sin(t)) * 0.25)
		}
		requestAnimationFrame(tick)
	}

	return requestAnimationFrame(tick)
}

export const LiveBusLayer: React.FC<{ map: TMap }> = ({ map }) => {
	const dispatch = useDispatch()
	const liveTrackingEnabled = useSelector(liveTrackingEnabledSelector)
	const showLiveBus = useSelector(showLiveBusSelector)
	const shouldPoll = liveTrackingEnabled && showLiveBus

	const pulseAnimRef = useRef<number | null>(null)
	const layersAddedRef = useRef(false)

	const { data: features } = useGetFeaturesQuery(undefined, { pollingInterval: 60_000 })

	useEffect(() => {
		if (features) dispatch(setLiveTracking(Boolean(features.liveTracking)))
	}, [features, dispatch])

	const { data: liveData } = useGetLiveQuery(undefined, {
		pollingInterval: 15_000,
		skip: !shouldPoll,
	})

	// Add source + layers once map is ready
	useEffect(() => {
		if (!map || layersAddedRef.current) return

		const activate = (): void => {
			addLayers(map)
			layersAddedRef.current = true
			pulseAnimRef.current = startPulse(map)
		}

		const setup = (): void => {
			void loadBusImage(map).then(activate).catch(activate)
		}

		if (map.isStyleLoaded()) {
			setup()
		} else {
			void map.once(`load`, setup)
		}
	}, [map])

	// Update source data when live data changes
	useEffect(() => {
		if (!map || !layersAddedRef.current) return

		const source = map.getSource(SOURCE_ID) as maptilersdk.GeoJSONSource | undefined
		if (!source) return

		const buses = shouldPoll ? liveData?.buses ?? [] : []
		source.setData(buildGeoJSON(buses))
	}, [liveData, shouldPoll, map])

	// Clear data when disabled
	useEffect(() => {
		if (shouldPoll || !map || !layersAddedRef.current) return

		const source = map.getSource(SOURCE_ID) as maptilersdk.GeoJSONSource | undefined
		source?.setData(EMPTY_GEOJSON)
	}, [shouldPoll, map])

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (pulseAnimRef.current) cancelAnimationFrame(pulseAnimRef.current)
			if (map) removeLayers(map)
			layersAddedRef.current = false
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return null
}
