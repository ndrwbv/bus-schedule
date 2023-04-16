/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useCallback, useEffect } from 'react'
import ReactHtmlParser, { convertNodeToElement, htmlparser2, processNodes } from 'react-html-parser'
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

import { getClusterMarkerIcon } from './clusterIcon'
import { clusterIconsCss } from './clusterIconCSS'
import { pinIcon, TColorTypes } from './icon'
import { myLocationIcon } from './styled'

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

// Если зум N взять остановки рядом и начать считать для них время
// Если зум/тач то эти остановки сбрасываются
// По умолчанию показывают сокращенное название остановки
// Добавить слежение за геолокацией и тогда перерисовывать на ходу

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

export const MapContentTiler: React.FC<{ map: any }> = ({ map }) => {
	const dispath = useDispatch()
	const busStop = useSelector(busStopNewSelector)
	const userLocation = useSelector(userLocationSelector)
	const currentDayKey = useSelector(currentDaySelector)
	const shedule = useSelector(scheduleSelector)

	useEverySecondUpdater()

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

	useEffect(() => {
		if (busStop) {
			map.flyTo(busStop.latLon, 18)
		}
	}, [busStop, map])

	useEffect(() => {
		if (userLocation) {
			map.flyTo([userLocation.coords.latitude, userLocation.coords.longitude], 18)
			dispath(setBottomSheetPosition(BottomSheetStates.MID))
		}
	}, [userLocation, map, dispath])

	const handleMarkerClick = useCallback(
		(stop: IStops<DirectionsNew.in> | IStops<DirectionsNew.out>) => (e: L.LeafletMouseEvent) => {
			console.log('marker click', e)
			dispath(dispath(setBusStopNew(stop.id)))
			map.flyTo({ lat: e.latlng.lat, lng: e.latlng.lng - 0.000357 }, 18)
			dispath(setBottomSheetPosition(BottomSheetStates.MID))
		},
		[dispath, map],
	)

	useEffect(() => {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore leaflet.markerCluster должен был переопределить типы L, но не смог

		if (!map) return

		STOPS.forEach(stop => {
			const icon = L.divIcon({
				className: `my-div-icon`,
				html: getPinContent(getCurrentTime(stop), stop.id),
				iconAnchor: [22, 94],
				shadowAnchor: [4, 62],
				popupAnchor: [-3, -76],
			})
			const html = getPinContent(getCurrentTime(stop), stop.id)

			const el = document.createElement(`div`)
			el.innerHTML = html.trim()
			// el.className = `marker`
			// el.style.backgroundImage = `url(https://placekitten.com/g/${marker.properties.iconSize.join(`/`)}/)`
			// el.style.width = `${marker.properties.iconSize[0]}px`
			// el.style.height = `${marker.properties.iconSize[1]}px`

			el.addEventListener(`click`, function (e) {
				console.log('click', stop, handleMarkerClick(stop)(e))
				handleMarkerClick(stop)
			})

			const marker = new maptilersdk.Marker(el)
				.on(`click`, handleMarkerClick(stop))
				.setLngLat([stop.latLon[1], stop.latLon[0]])
				.addTo(map)
		})
	}, [getCurrentTime, handleMarkerClick, map])

	return <GlobalStyle />
}
