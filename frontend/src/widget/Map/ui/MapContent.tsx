/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import maplibregl from 'maplibre-gl'
import { BottomSheetStates, setBottomSheetPosition } from 'features/BottomSheet/model/bottomSheetSlice'
import { userLocationSelector } from 'features/MyLocation/model/myLocationSlice'
import { AndrewLytics } from 'shared/lib'
import { calculateHowMuchIsLeft } from 'shared/lib/time/calculateHowMuchIsLeft'
import { findClosesTime } from 'shared/lib/time/findClosesTime'
import { busStopNewSelector, setBusStopNew } from 'shared/store/busStop/busStopInfoSlice'
import { STOPS } from 'shared/store/busStop/const/stops'
import { DirectionsNew, IStops } from 'shared/store/busStop/Stops'
import { currentDaySelector, scheduleSelector } from 'shared/store/schedule/scheduleSlice'
import { ITime } from 'shared/store/timeLeft/ITime'

import { TMap } from '../TMap'
import { getPinContent } from './getPinContent'
import { GlobalStyle } from './GlobalStyle'
import { LiveBusLayer } from './LiveBusLayer'

interface IFeature {
	type: 'Feature'
	properties: IStops<DirectionsNew.inSP> | IStops<DirectionsNew.out> | IStops<DirectionsNew.inLB>
	geometry: {
		type: `Point`
		coordinates: [number, number]
	}
}

const STOPS_SOURCE_ID = `stopssource`

export const MapContent: React.FC<{ map: TMap; mapLoaded: boolean }> = ({ map, mapLoaded }) => {
	const dispath = useDispatch()
	const busStop = useSelector(busStopNewSelector)
	const userLocation = useSelector(userLocationSelector)
	const currentDayKey = useSelector(currentDaySelector)
	const shedule = useSelector(scheduleSelector)
	const [stopsCollection, setStopsCollections] = useState<IFeature[]>([])

	const getCurrentTime = useCallback(
		(stop: IStops<DirectionsNew.inSP> | IStops<DirectionsNew.out> | IStops<DirectionsNew.inLB>): ITime => {
			const daySchedule = shedule[stop.direction][currentDayKey] as Record<string, string[] | undefined>
			const times = daySchedule[stop.label]

			if (!times || times.length === 0)
				return {
					hours: null,
					minutes: null,
				}

			const closestTime = findClosesTime(times)

			if (!closestTime)
				return {
					hours: null,
					minutes: null,
				}

			return calculateHowMuchIsLeft(closestTime)
		},
		[currentDayKey, shedule],
	)

	const flyToStop = useCallback(
		(stop: IStops<DirectionsNew>) => {
			map?.flyTo({
				center: [stop.latLon[1], stop.latLon[0]],
				essential: true,
				zoom: 18,
			})
		},
		[map],
	)

	useEffect(() => {
		if (busStop) {
			flyToStop(busStop)
		}
	}, [busStop, flyToStop, map])

	useEffect(() => {
		if (userLocation) {
			AndrewLytics(`map:flytouser`)

			map?.flyTo({
				center: [userLocation.coords.longitude, userLocation.coords.latitude],
				essential: true,
				zoom: 15,
			})

			dispath(setBottomSheetPosition(BottomSheetStates.MID))
		}
	}, [userLocation, map, dispath])

	const handleMarkerClick = useCallback(
		(stop: IStops<DirectionsNew.inSP> | IStops<DirectionsNew.out> | IStops<DirectionsNew.inLB>) => {
			dispath(dispath(setBusStopNew(stop.id)))
			dispath(setBottomSheetPosition(BottomSheetStates.MID))

			flyToStop(stop)

			AndrewLytics(`map:markerclick`)
		},
		[dispath, flyToStop],
	)

	// eslint-disable-next-line sonarjs/cognitive-complexity
	useEffect(() => {

		if (!map) return undefined
		if (!mapLoaded) return undefined

		const newMarkers: Record<string, maplibregl.Marker> = {}

		const removeMarkers = (liveIds?: string[]): void => {
			Object.keys(newMarkers).forEach(markerId => {
				if (liveIds && liveIds.includes(markerId)) {
					return
				}

				newMarkers[markerId].remove()
				delete newMarkers[markerId]
			})
		}

		const updateMarkers = (): void => {
			const features = map.querySourceFeatures(STOPS_SOURCE_ID) as any[] | undefined

			if (!features || features.length === 0) return

			const featureIds: string[] = []

			for (let i = 0; i < features.length; i++) {
				const props = features[i].properties

				if (props.cluster_id) continue

				const { id } = props as
					| IStops<DirectionsNew.inSP>
					| IStops<DirectionsNew.out>
					| IStops<DirectionsNew.inLB>

				featureIds.push(id)

				// Skip if marker already exists
				if (newMarkers[id]) continue

				const coords = features[i].geometry.coordinates
				const stop = features[i].properties
				stop.latLon = JSON.parse(stop.latLon)

				const html = getPinContent(getCurrentTime(stop), stop.id)

				const el = document.createElement(`div`)
				el.innerHTML = html.trim()

				el.addEventListener(`click`, () => {
					handleMarkerClick(stop)
				})

				const marker = new maplibregl.Marker({ element: el })
					.setLngLat(coords)
					.addTo(map)

				newMarkers[id] = marker
			}

			removeMarkers(featureIds)
		}

		const onData = (e: any): void => {
			if (e.dataType !== `source` || e.sourceId !== STOPS_SOURCE_ID || !e.isSourceLoaded) return

			updateMarkers()
		}

		const onZoomEnd = (): void => {
			if (map.getZoom() < 15) {
				removeMarkers()
			} else {
				updateMarkers()
			}

			AndrewLytics(`map:zoomend`)
		}

		const onDragEnd = (): void => {
			updateMarkers()
		}

		// after the GeoJSON data is loaded, update markers on the screen and do so on every map move/moveend
		map.on(`data`, onData)
		map.on(`zoomend`, onZoomEnd)
		map.on(`dragend`, onDragEnd)

		// If source already has data (e.g. effect re-ran due to getCurrentTime change), render immediately
		if (map.getSource(STOPS_SOURCE_ID) && map.getZoom() >= 15) {
			updateMarkers()
		}

		return () => {
			map.off(`data`, onData)
			map.off(`zoomend`, onZoomEnd)
			map.off(`dragend`, onDragEnd)
			removeMarkers()
		}
	}, [getCurrentTime, handleMarkerClick, map, mapLoaded])

	// eslint-disable-next-line sonarjs/cognitive-complexity
	useEffect(() => {
		if (!map || !mapLoaded || stopsCollection.length === 0) return undefined

		if (map.getSource(STOPS_SOURCE_ID)) {
			try {
				map.removeLayer(`clusters`)
				map.removeLayer(`cluster-count`)
				map.removeLayer(`unclustered-point`)
				map.removeSource(STOPS_SOURCE_ID)
			} catch {
				// layers may not exist yet
			}
		}

		map.addSource(STOPS_SOURCE_ID, {
			type: `geojson`,
			data: {
				type: `FeatureCollection`,
				features: stopsCollection,
			},
			cluster: true,
			clusterMaxZoom: 14,
			clusterRadius: 50,
		})

		map.addLayer({
			id: `clusters`,
			type: `circle`,
			source: STOPS_SOURCE_ID,
			filter: [`has`, `point_count`],
			paint: {
				'circle-color': [`step`, [`get`, `point_count`], `#47daff`, 100, `#f1f075`, 750, `#f28cb1`],
				'circle-radius': [`step`, [`get`, `point_count`], 20, 100, 30, 750, 40],
			},
		})

		map.addLayer({
			id: `cluster-count`,
			type: `symbol`,
			source: STOPS_SOURCE_ID,
			filter: [`has`, `point_count`],
			layout: {
				'text-field': `{point_count_abbreviated}`,
				'text-font': [`Noto Sans Regular`],
				'text-size': 12,
			},
		})

		map.addLayer({
			id: `unclustered-point`,
			type: `circle`,
			source: STOPS_SOURCE_ID,
			filter: [`!`, [`has`, `point_count`]],
			maxzoom: 15,
			paint: {
				'circle-color': `#47daff`,
				'circle-radius': 6,
				'circle-stroke-width': 2,
				'circle-stroke-color': `#fff`,
			},
		})

		const onClusterClick = (e: any): void => {
			const features = map.queryRenderedFeatures(e.point, {
				layers: [`clusters`],
			})

			const clusterId = features[0].properties.cluster_id

			// @ts-ignore
			map.getSource(STOPS_SOURCE_ID)?.getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
				if (err) return

				AndrewLytics(`map:clusterclick`)

				map.easeTo({
					center: (features[0] as any).geometry.coordinates,
					zoom,
				})
			})
		}

		const onMouseEnter = (): void => {
			map.getCanvas().style.cursor = `pointer`
		}

		const onMouseLeave = (): void => {
			map.getCanvas().style.cursor = ``
		}

		map.on(`click`, `clusters`, onClusterClick)
		map.on(`mouseenter`, `clusters`, onMouseEnter)
		map.on(`mouseleave`, `clusters`, onMouseLeave)

		return () => {
			map.off(`click`, `clusters`, onClusterClick)
			map.off(`mouseenter`, `clusters`, onMouseEnter)
			map.off(`mouseleave`, `clusters`, onMouseLeave)

			try {
				map.removeLayer(`clusters`)
				map.removeLayer(`cluster-count`)
				map.removeLayer(`unclustered-point`)
				map.removeSource(STOPS_SOURCE_ID)
			} catch {
				// map may already be destroyed
			}
		}
	}, [map, stopsCollection, mapLoaded])

	useEffect(() => {
		if (!map) return

		const features: IFeature[] = STOPS.map(stop => ({
			type: `Feature`,
			properties: {
				...stop,
			},
			geometry: { type: `Point`, coordinates: [stop.latLon[1], stop.latLon[0]] },
		}))

		setStopsCollections(features)
	}, [map])

	useEffect(() => {
		if (!map) return undefined

		const onDragStart = (): void => {
			dispath(setBottomSheetPosition(BottomSheetStates.BOTTOM))
			AndrewLytics(`map:dragstart`)
		}

		map.on(`dragstart`, onDragStart)

		return () => {
			map.off(`dragstart`, onDragStart)
		}
	}, [dispath, map])

	return (
		<>
			<GlobalStyle />
			<LiveBusLayer map={map} />
		</>
	)
}
