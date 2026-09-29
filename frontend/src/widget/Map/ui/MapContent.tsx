/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { BottomSheetStates, setBottomSheetPosition } from 'features/BottomSheet/model/bottomSheetSlice'
import { MapAdBanner } from 'features/MapAdBanner'
import { userLocationSelector } from 'features/MyLocation/model/myLocationSlice'
import maplibregl, { GeoJSONSource } from 'maplibre-gl'
import { AndrewLytics } from 'shared/lib'
import { busStopNewSelector, setBusStopNew } from 'shared/store/busStop/busStopInfoSlice'
import { STOPS } from 'shared/store/busStop/const/stops'
import { DirectionsNew, IStops } from 'shared/store/busStop/Stops'
import { currentDaySelector, scheduleSelector } from 'shared/store/schedule/scheduleSlice'

import { TMap } from '../TMap'
import { GlobalStyle } from './GlobalStyle'
import { LiveBusLayer } from './LiveBusLayer'
import { getPinTime, stopPinHtml } from './stopPin'

type Stop = IStops<DirectionsNew>

const STOPS_SOURCE_ID = `stopssource`
const LAYER_CLUSTERS = `clusters`
const LAYER_CLUSTER_COUNT = `cluster-count`
const LAYER_POINTS = `unclustered-point`
/** Below this zoom stops are dots and clusters; from it on — pins with times */
const PINS_MIN_ZOOM = 15
const PIN_REFRESH_MS = 30_000
const DIRECTION_COLORS = { toCity: `#336cff`, fromCity: `#e8680c` }

const STOPS_BY_ID = new Map(STOPS.map(stop => [stop.id, stop]))

/** Every stop but the selected one — the selected stop is drawn separately and never clustered */
const stopsFeatureCollection = (excludeId: string | null): GeoJSON.FeatureCollection<GeoJSON.Point> => ({
	type: `FeatureCollection`,
	features: STOPS.filter(stop => stop.id !== excludeId).map(stop => ({
		type: `Feature`,
		properties: { id: stop.id, direction: stop.direction },
		geometry: { type: `Point`, coordinates: [stop.latLon[1], stop.latLon[0]] },
	})),
})

interface PinEntry {
	marker: maplibregl.Marker
	el: HTMLDivElement
	stop: Stop
	selected: boolean
}

export const MapContent: React.FC<{ map: TMap; mapLoaded: boolean }> = ({ map, mapLoaded }) => {
	const dispatch = useDispatch()
	const busStop = useSelector(busStopNewSelector)
	const userLocation = useSelector(userLocationSelector)
	const currentDayKey = useSelector(currentDaySelector)
	const schedule = useSelector(scheduleSelector)
	const [tick, setTick] = useState(0)

	// Marker handlers live in map event callbacks — refs keep them reading fresh data without re-subscribing
	const scheduleRef = useRef(schedule)
	const dayRef = useRef(currentDayKey)
	const selectedIdRef = useRef<string | null>(busStop?.id ?? null)
	scheduleRef.current = schedule
	dayRef.current = currentDayKey
	selectedIdRef.current = busStop?.id ?? null

	const pinsRef = useRef(new Map<string, PinEntry>())
	const selectedPinRef = useRef<PinEntry | null>(null)

	const renderPin = useCallback((entry: PinEntry): void => {
		const time = getPinTime(scheduleRef.current, entry.stop, dayRef.current)
		entry.el.innerHTML = stopPinHtml(entry.stop, time, entry.selected).trim()
	}, [])

	const flyToStop = useCallback(
		(stop: Stop) => {
			map?.flyTo({
				center: [stop.latLon[1], stop.latLon[0]],
				essential: true,
				zoom: 18,
			})
		},
		[map],
	)

	const handlePinClick = useCallback(
		(stop: Stop) => {
			dispatch(setBusStopNew(stop.id))
			dispatch(setBottomSheetPosition(BottomSheetStates.MID))
			flyToStop(stop)

			AndrewLytics(`map:markerclick`)
		},
		[dispatch, flyToStop],
	)

	const createPin = useCallback(
		(stop: Stop, selected: boolean): PinEntry | null => {
			if (!map) return null

			const el = document.createElement(`div`)
			el.addEventListener(`click`, e => {
				e.stopPropagation()
				handlePinClick(stop)
			})
			if (selected) el.style.zIndex = `10`

			const marker = new maplibregl.Marker({ element: el, anchor: `bottom` })
				.setLngLat([stop.latLon[1], stop.latLon[0]])
				.addTo(map)
			const entry: PinEntry = { marker, el, stop, selected }
			renderPin(entry)

			return entry
		},
		[handlePinClick, map, renderPin],
	)

	useEffect(() => {
		if (busStop) {
			flyToStop(busStop)
		}
	}, [busStop, flyToStop])

	useEffect(() => {
		if (userLocation) {
			AndrewLytics(`map:flytouser`)

			map?.flyTo({
				center: [userLocation.coords.longitude, userLocation.coords.latitude],
				essential: true,
				zoom: 15,
			})

			dispatch(setBottomSheetPosition(BottomSheetStates.MID))
		}
	}, [userLocation, map, dispatch])

	// Times on pins go stale — redraw them every 30 s and whenever the schedule or the day changes
	useEffect(() => {
		const id = setInterval(() => setTick(t => t + 1), PIN_REFRESH_MS)

		return () => clearInterval(id)
	}, [])

	useEffect(() => {
		pinsRef.current.forEach(renderPin)
		if (selectedPinRef.current) renderPin(selectedPinRef.current)
	}, [tick, schedule, currentDayKey, renderPin])

	// Source + layers: dots and clusters for every stop except the selected one
	useEffect(() => {
		if (!map || !mapLoaded) return undefined

		const removeLayers = (): void => {
			;[LAYER_CLUSTERS, LAYER_CLUSTER_COUNT, LAYER_POINTS].forEach(id => {
				if (map.getLayer(id)) map.removeLayer(id)
			})
			if (map.getSource(STOPS_SOURCE_ID)) map.removeSource(STOPS_SOURCE_ID)
		}

		try {
			removeLayers()

			map.addSource(STOPS_SOURCE_ID, {
				type: `geojson`,
				data: stopsFeatureCollection(selectedIdRef.current),
				cluster: true,
				clusterMaxZoom: 14,
				clusterRadius: 45,
			})

			map.addLayer({
				id: LAYER_CLUSTERS,
				type: `circle`,
				source: STOPS_SOURCE_ID,
				filter: [`has`, `point_count`],
				paint: {
					'circle-color': `#1d1d1f`,
					'circle-opacity': 0.85,
					'circle-radius': [`step`, [`get`, `point_count`], 16, 5, 20, 15, 25],
					'circle-stroke-width': 3,
					'circle-stroke-color': `#fff`,
				},
			})

			map.addLayer({
				id: LAYER_CLUSTER_COUNT,
				type: `symbol`,
				source: STOPS_SOURCE_ID,
				filter: [`has`, `point_count`],
				layout: {
					'text-field': `{point_count_abbreviated}`,
					'text-font': [`Noto Sans Regular`],
					'text-size': 13,
				},
				paint: {
					'text-color': `#fff`,
				},
			})

			map.addLayer({
				id: LAYER_POINTS,
				type: `circle`,
				source: STOPS_SOURCE_ID,
				filter: [`!`, [`has`, `point_count`]],
				maxzoom: PINS_MIN_ZOOM,
				paint: {
					'circle-color': [
						`match`,
						[`get`, `direction`],
						DirectionsNew.out,
						DIRECTION_COLORS.toCity,
						DIRECTION_COLORS.fromCity,
					],
					'circle-radius': 6,
					'circle-stroke-width': 2,
					'circle-stroke-color': `#fff`,
				},
			})
		} catch {
			// Style may not be fully ready yet
			return undefined
		}

		const onClusterClick = (e: maplibregl.MapMouseEvent): void => {
			const features = map.queryRenderedFeatures(e.point, { layers: [LAYER_CLUSTERS] })
			const clusterId = features[0]?.properties.cluster_id as number | undefined
			if (clusterId === undefined) return

			const source = map.getSource<GeoJSONSource>(STOPS_SOURCE_ID)
			source
				?.getClusterExpansionZoom(clusterId)
				.then(zoom => {
					AndrewLytics(`map:clusterclick`)
					map.easeTo({
						center: (features[0].geometry as GeoJSON.Point).coordinates as [number, number],
						zoom,
					})

					return undefined
				})
				.catch(() => undefined)
		}

		const onPointClick = (e: any): void => {
			const stop = STOPS_BY_ID.get(e.features?.[0]?.properties?.id as string)
			if (stop) handlePinClick(stop)
		}

		const setPointer = (): void => {
			map.getCanvas().style.cursor = `pointer`
		}
		const resetPointer = (): void => {
			map.getCanvas().style.cursor = ``
		}

		map.on(`click`, LAYER_CLUSTERS, onClusterClick)
		map.on(`click`, LAYER_POINTS, onPointClick)
		;[LAYER_CLUSTERS, LAYER_POINTS].forEach(layer => {
			map.on(`mouseenter`, layer, setPointer)
			map.on(`mouseleave`, layer, resetPointer)
		})

		return () => {
			map.off(`click`, LAYER_CLUSTERS, onClusterClick)
			map.off(`click`, LAYER_POINTS, onPointClick)
			;[LAYER_CLUSTERS, LAYER_POINTS].forEach(layer => {
				map.off(`mouseenter`, layer, setPointer)
				map.off(`mouseleave`, layer, resetPointer)
			})

			try {
				removeLayers()
			} catch {
				// map may already be destroyed
			}
		}
	}, [handlePinClick, map, mapLoaded])

	// Pins with times for the stops the source currently shows unclustered (zoom ≥ 15)
	useEffect(() => {
		if (!map || !mapLoaded) return undefined

		const removePins = (keepIds?: Set<string>): void => {
			pinsRef.current.forEach((entry, id) => {
				if (keepIds?.has(id)) return

				entry.marker.remove()
				pinsRef.current.delete(id)
			})
		}

		const updatePins = (): void => {
			if (map.getZoom() < PINS_MIN_ZOOM || !map.getSource(STOPS_SOURCE_ID)) {
				removePins()

				return
			}

			const visibleIds = new Set<string>()

			map.querySourceFeatures(STOPS_SOURCE_ID).forEach(feature => {
				if (feature.properties.cluster_id) return

				const id = feature.properties.id as string
				if (id === selectedIdRef.current) return

				visibleIds.add(id)
				if (pinsRef.current.has(id)) return

				const stop = STOPS_BY_ID.get(id)
				if (!stop) return

				const entry = createPin(stop, false)
				if (entry) pinsRef.current.set(id, entry)
			})

			removePins(visibleIds)
		}

		const onData = (e: any): void => {
			if (e.dataType !== `source` || e.sourceId !== STOPS_SOURCE_ID || !e.isSourceLoaded) return

			updatePins()
		}

		const onZoomEnd = (): void => {
			updatePins()
			AndrewLytics(`map:zoomend`)
		}

		map.on(`data`, onData)
		map.on(`zoomend`, onZoomEnd)
		map.on(`moveend`, updatePins)

		updatePins()

		return () => {
			map.off(`data`, onData)
			map.off(`zoomend`, onZoomEnd)
			map.off(`moveend`, updatePins)
			removePins()
		}
	}, [createPin, map, mapLoaded])

	// The selected stop: out of the clustered source, drawn as a big pin at every zoom
	useEffect(() => {
		if (!map || !mapLoaded) return undefined

		const source = map.getSource<GeoJSONSource>(STOPS_SOURCE_ID)
		source?.setData(stopsFeatureCollection(busStop?.id ?? null))

		if (!busStop) return undefined

		// it may have been drawn as an ordinary pin a moment ago
		pinsRef.current.get(busStop.id)?.marker.remove()
		pinsRef.current.delete(busStop.id)

		const entry = createPin(busStop, true)
		selectedPinRef.current = entry

		return () => {
			entry?.marker.remove()
			selectedPinRef.current = null
		}
	}, [busStop, createPin, map, mapLoaded])

	useEffect(() => {
		if (!map) return undefined

		const onDragStart = (): void => {
			dispatch(setBottomSheetPosition(BottomSheetStates.BOTTOM))
			AndrewLytics(`map:dragstart`)
		}

		map.on(`dragstart`, onDragStart)

		return () => {
			map.off(`dragstart`, onDragStart)
		}
	}, [dispatch, map])

	return (
		<>
			<GlobalStyle />
			<LiveBusLayer map={map} />
			<MapAdBanner map={map} mapLoaded={mapLoaded} />
		</>
	)
}
