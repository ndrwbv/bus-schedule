/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import * as maptilersdk from '@maptiler/sdk'
import { BottomSheetStates, setBottomSheetPosition } from 'entities/BottomSheet/model/bottomSheetSlice'
import { userLocationSelector } from 'features/MyLocation/model/myLocationSlice'
import { AndrewLytics } from 'shared/lib'
import { calculateHowMuchIsLeft } from 'shared/lib/time/calculateHowMuchIsLeft'
import { findClosesTime } from 'shared/lib/time/findClosesTime'
import { busStopNewSelector, setBusStopNew } from 'shared/store/busStop/busStopInfoSlice'
import { STOPS } from 'shared/store/busStop/const/stops'
import { DirectionsNew, IStops } from 'shared/store/busStop/Stops'
import { currentDaySelector, scheduleSelector } from 'shared/store/schedule/scheduleSlice'
import { ITime } from 'shared/store/timeLeft/ITime'
import useEverySecondUpdater from 'shared/store/timeLeft/useEverySecondUpdater'

import { TMap } from '../TMap'
import { getPinContent } from './getPinContent'
import { GlobalStyle } from './GlobalStyle'

interface IFeature {
	type: 'Feature'
	properties: IStops<DirectionsNew.in> | IStops<DirectionsNew.out>
	geometry: {
		type: `Point`
		coordinates: [number, number]
	}
}

const STOPS_SOURCE_ID = `stopssource`

export const MapContent: React.FC<{ map: TMap }> = ({ map }) => {
	const dispath = useDispatch()
	const busStop = useSelector(busStopNewSelector)
	const userLocation = useSelector(userLocationSelector)
	const currentDayKey = useSelector(currentDaySelector)
	const shedule = useSelector(scheduleSelector)
	const [stopsCollection, setStopsCollections] = useState<IFeature[]>([])
	const updater = useEverySecondUpdater()
	const [mapLoaded, setMapLoaded] = useState(false)

	const getCurrentTime = useCallback(
		(stop: IStops<DirectionsNew.in> | IStops<DirectionsNew.out>): ITime => {
			const closestTime = findClosesTime(shedule[stop.direction][currentDayKey][stop.label])

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
		(stop: IStops<DirectionsNew.in> | IStops<DirectionsNew.out>) => {
			dispath(dispath(setBusStopNew(stop.id)))
			dispath(setBottomSheetPosition(BottomSheetStates.MID))

			flyToStop(stop)

			AndrewLytics(`map:markerclick`)
		},
		[dispath, flyToStop],
	)

	useEffect(() => {
		if (!map) return

		map.on(`load`, () => {
			setMapLoaded(true)
		})
	}, [map])

	// eslint-disable-next-line sonarjs/cognitive-complexity
	useEffect(() => {
		if (!map) return
		if (!mapLoaded) return

		const newMarkers: Record<string, maptilersdk.Marker> = {}

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
			const features: any[] = map.querySourceFeatures(STOPS_SOURCE_ID)

			const featureIds = features.map(feature => feature.properties.id as string)

			for (let i = 0; i < features.length; i++) {
				const coords = features[i].geometry.coordinates
				const props = features[i].properties

				if (props.cluster_id) return

				const { id } = props as IStops<DirectionsNew.in> | IStops<DirectionsNew.out>

				const stop = features[i].properties
				stop.latLon = JSON.parse(stop.latLon)

				const html = getPinContent(getCurrentTime(stop), stop.id)

				const el = document.createElement(`div`)
				el.innerHTML = html.trim()

				el.addEventListener(`click`, () => {
					handleMarkerClick(stop)
				})

				const marker = new maptilersdk.Marker(el)
					.on(`click`, () => handleMarkerClick(stop))
					.setLngLat(coords)
					.addTo(map)

				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				if (newMarkers[id]) {
					newMarkers[id].remove()
				}

				newMarkers[id] = marker
			}

			removeMarkers(featureIds)
		}

		const onLoad = (e: any): void => {
			if (e.sourceId !== STOPS_SOURCE_ID || !e.isSourceLoaded) return

			updateMarkers()
		}

		// after the GeoJSON data is loaded, update markers on the screen and do so on every map move/moveend
		map.on(`data`, onLoad)

		map.on(`zoomend`, () => {
			if (map.getZoom() < 15) {
				removeMarkers()
			} else {
				updateMarkers()
			}

			AndrewLytics(`map:zoomend`)
		})

		map.on(`dragend`, () => {
			updateMarkers()
		})

		// eslint-disable-next-line consistent-return
		return () => {
			removeMarkers()
		}
	}, [getCurrentTime, handleMarkerClick, map, mapLoaded])

	useEffect(() => {
		if (!map || !mapLoaded || !map.isStyleLoaded()) return

		if (map.getSource(STOPS_SOURCE_ID)) {
			map.removeLayer(`clusters`)
			map.removeLayer(`cluster-count`)
			map.removeSource(STOPS_SOURCE_ID)
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
				// Use step expressions (https://docs.maptiler.com/gl-style-specification/expressions/#step)
				// with three steps to implement three types of circles:
				//   * Blue, 20px circles when point count is less than 100
				//   * Yellow, 30px circles when point count is between 100 and 750
				//   * Pink, 40px circles when point count is greater than or equal to 750
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
				'text-font': [`DIN Offc Pro Medium`, `Arial Unicode MS Bold`],
				'text-size': 12,
			},
		})

		map.on(`click`, `clusters`, e => {
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
		})

		map.on(`mouseenter`, `clusters`, () => {
			map.getCanvas().style.cursor = `pointer`
		})
		map.on(`mouseleave`, `clusters`, () => {
			map.getCanvas().style.cursor = ``
		})
	}, [map, stopsCollection, mapLoaded, getCurrentTime, handleMarkerClick])

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
	}, [getCurrentTime, handleMarkerClick, map, updater])

	useEffect(() => {
		map?.on(`dragstart`, () => {
			dispath(setBottomSheetPosition(BottomSheetStates.BOTTOM))
			AndrewLytics(`map:dragstart`)
		})
	}, [dispath, map])

	return <GlobalStyle />
}
