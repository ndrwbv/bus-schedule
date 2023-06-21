/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import * as maptilersdk from '@maptiler/sdk'
import { BottomSheetStates, setBottomSheetPosition } from 'features/BottomSheet/model/bottomSheetSlice'
import { userLocationSelector } from 'features/MyLocation/model/myLocationSlice'
import { calculateHowMuchIsLeft } from 'shared/lib/time/calculateHowMuchIsLeft'
import { findClosesTime } from 'shared/lib/time/findClosesTime'
import { busStopNewSelector, setBusStopNew } from 'shared/store/busStop/busStopInfoSlice'
import { STOPS } from 'shared/store/busStop/const/stops'
import { DirectionsNew, IStops } from 'shared/store/busStop/Stops'
import { currentDaySelector, scheduleSelector } from 'shared/store/schedule/scheduleSlice'
import { ITime } from 'shared/store/timeLeft/ITime'
import useEverySecondUpdater from 'shared/store/timeLeft/useEverySecondUpdater'
import { createGlobalStyle } from 'styled-components'

import { clusterIconsCss } from '../assets/clusterIconCSS'
import { pinIcon, TColorTypes } from '../assets/icon'
import { TMap } from '../TMap'

const GlobalStyle = createGlobalStyle`
 .pin {
	position: relative
 }

 .pin-text {
	position: absolute;
	top: 0;
	left: 0;

	width: 46px;
	height: 46px;

	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	
	font-weight: 400;
	color: #ffff;
 }

 .pin-text__amount {
	 font-size: 20px;
	 line-height: 14px;
 }

 .pin-text__unit {
	font-size: 13px
 }

${clusterIconsCss}
`

const colorDecider = (timeLeft: ITime): TColorTypes => {
	if (timeLeft.hours === null || timeLeft.minutes === null) return `BLACK`

	if (timeLeft.hours > 3) return `BLACK`
	if (timeLeft.minutes >= 40) return `BLUE`
	if (timeLeft.minutes >= 20 && timeLeft.minutes < 40) return `GREEN`
	if (timeLeft.minutes > 0 && timeLeft.minutes < 20) return `RED`

	return `BLACK`
}

const getLeftString = (timeLeft: ITime): { text: string; unit: string | null } => {
	if (timeLeft.hours === null || timeLeft.minutes === null || timeLeft.hours > 3)
		return {
			text: `(^__^)`,
			unit: null,
		}

	if (timeLeft.hours !== 0)
		return {
			text: `>${timeLeft.hours}`,
			unit: `час`,
		}

	return {
		text: `${timeLeft.minutes}`,
		unit: `мин`,
	}
}

const getPinContent = (timeLeft: ITime, stopId: string): string => {
	const leftString = getLeftString(timeLeft)
	const color = colorDecider(timeLeft)

	return `
		<div class="pin">
			<div class="pin-text">
				<p class="pin-text__amount">${leftString.text}</p>
				${leftString.unit !== null ? `<p class="pin-text__unit">${leftString.unit}</p>` : ``} 
			</div>

			 ${pinIcon(color, stopId)}
		</div>
	`
}

const STOPS_SOURCE_ID = `stopssource`

export const MapContent: React.FC<{ map: TMap }> = ({ map }) => {
	const dispath = useDispatch()
	const busStop = useSelector(busStopNewSelector)
	const userLocation = useSelector(userLocationSelector)
	const currentDayKey = useSelector(currentDaySelector)
	const shedule = useSelector(scheduleSelector)
	const [stopsCollection, setStopsCollections] = useState([])
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

			flyToStop(stop)

			dispath(setBottomSheetPosition(BottomSheetStates.MID))
		},
		[dispath, flyToStop],
	)

	useEffect(() => {
		if (!map) return

		map.on(`load`, () => {
			setMapLoaded(true)
		})
	}, [map])

	useEffect(() => {
		if (!map) return

		if (!mapLoaded) return

		const newMarkers: any = {}

		const removeMarkers = (liveIds?: string[]): void => {
			Object.keys(newMarkers).forEach(markerId => {
				if (liveIds && liveIds.includes(markerId)) {
					console.log(`skip`, markerId)

					return
				}

				newMarkers[markerId].remove()
				delete newMarkers[markerId]
			})
		}

		const updateMarkers = (): void => {
			const features = map.querySourceFeatures(STOPS_SOURCE_ID)

			const featureIds = features.map(feature => feature.properties.id)
			removeMarkers(featureIds)

			for (let i = 0; i < features.length; i++) {
				const coords = features[i].geometry.coordinates
				const props = features[i].properties
				const { id } = props

				if (props.cluster_id) return

				const stop = features[i].properties
				const html = getPinContent(getCurrentTime(stop), stop.id)

				const el = document.createElement(`div`)
				el.innerHTML = html.trim()

				el.addEventListener(`click`, () => {
					handleMarkerClick(stop)
				})

				if (newMarkers[id]) {
					newMarkers[id].remove()
				}

				const marker = new maptilersdk.Marker(el)
					.on(`click`, () => handleMarkerClick(stop))
					.setLngLat(coords)
					.addTo(map)

				newMarkers[id] = marker
			}
		}

		const onLoad = (e: any): void => {
			if (e.sourceId !== STOPS_SOURCE_ID || !e.isSourceLoaded) return

			updateMarkers()
		}

		// after the GeoJSON data is loaded, update markers on the screen and do so on every map move/moveend
		map.on(`data`, onLoad)

		map.on(`zoomend`, () => {
			console.log(map.getZoom())
			if (map.getZoom() < 15) {
				removeMarkers()
			} else {
				updateMarkers()
			}
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
		if (!map) return

		if (!mapLoaded) return

		if (map.getSource(STOPS_SOURCE_ID)) {
			map.removeLayer(`clusters`)
			map.removeLayer(`cluster-count`)
			map.removeLayer(`unclustered-point`)
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
				'circle-color': [`step`, [`get`, `point_count`], `#51bbd6`, 100, `#f1f075`, 750, `#f28cb1`],
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

		map.on(`click`, `clusters`, function (e) {
			const features = map.queryRenderedFeatures(e.point, {
				layers: [`clusters`],
			})

			const clusterId = features[0].properties.cluster_id
			map.getSource(STOPS_SOURCE_ID).getClusterExpansionZoom(clusterId, function (err, zoom) {
				if (err) return

				map.easeTo({
					center: features[0].geometry.coordinates,
					zoom,
				})
			})
		})

		map.on(`mouseenter`, `clusters`, function () {
			map.getCanvas().style.cursor = `pointer`
		})
		map.on(`mouseleave`, `clusters`, function () {
			map.getCanvas().style.cursor = ``
		})
	}, [map, stopsCollection, mapLoaded, getCurrentTime, handleMarkerClick])

	useEffect(() => {
		if (!map) return

		const features = STOPS.map(stop => ({
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
		})
	}, [dispath, map])

	return <GlobalStyle />
}
