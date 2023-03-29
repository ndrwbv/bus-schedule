import React, { useEffect } from 'react'
import { Marker, useMap, useMapEvents } from 'react-leaflet'
import { useDispatch, useSelector } from 'react-redux'
import { BottomSheetStates, setBottomSheetPosition } from 'features/BottomSheet/model/bottomSheetSlice'
import { userLocationSelector } from 'features/MyLocation/model/myLocationSlice'
import L from 'leaflet'
import { calculateHowMuchIsLeft } from 'shared/lib/time/calculateHowMuchIsLeft'
import { findClosesTime } from 'shared/lib/time/findClosesTime'
import { busStopNewSelector, setBusStopNew } from 'shared/store/busStop/busStopInfoSlice'
import { STOPS } from 'shared/store/busStop/const/stops'
import { DirectionsNew, IStops } from 'shared/store/busStop/Stops'
import { currentDaySelector, scheduleSelector } from 'shared/store/schedule/scheduleSlice'
import { ITime } from 'shared/store/timeLeft/ITime'
import useEverySecondUpdater from 'shared/store/timeLeft/useEverySecondUpdater'
import { createGlobalStyle } from 'styled-components'

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
			text: `(#__#)`,
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

const getPinContent = (timeLeft: ITime): string => {
	const leftString = getLeftString(timeLeft)
	const color = colorDecider(timeLeft)

	return `
		<div class="pin">
			<div class="pin-text">
				<p class="pin-text__amount">${leftString.text}</p>
				${leftString.unit !== null ? `<p class="pin-text__unit">${leftString.unit}</p>` : ``} 
			</div>

			 ${pinIcon(color)}
		</div>
	`
}

export const MapContent: React.FC = () => {
	const map = useMap()
	const dispath = useDispatch()
	const busStop = useSelector(busStopNewSelector)
	const userLocation = useSelector(userLocationSelector)
	const currentDayKey = useSelector(currentDaySelector)
	const shedule = useSelector(scheduleSelector)

	useEverySecondUpdater()

	const getCurrentTime = (stop: IStops<DirectionsNew.in> | IStops<DirectionsNew.out>): ITime => {
		const closestTime = findClosesTime(shedule[stop.direction][currentDayKey][stop.label])

		if (!closestTime)
			return {
				hours: null,
				minutes: null,
			}

		return calculateHowMuchIsLeft(closestTime)
	}

	useMapEvents({
		dragstart: () => {
			dispath(setBottomSheetPosition(BottomSheetStates.BOTTOM))
		},
	})

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

	return (
		<>
			<GlobalStyle />
			{STOPS.map(stop => (
				<Marker
					
					icon={L.divIcon({
						className: 'my-div-icon',
						html: getPinContent(getCurrentTime(stop)),
					})}
					key={stop.id}
					position={stop.latLon}
					eventHandlers={{
						click: e => {
							dispath(dispath(setBusStopNew(stop.id)))
							map.flyTo({ lat: e.latlng.lat, lng: e.latlng.lng - 0.000357 }, 18)
							dispath(setBottomSheetPosition(BottomSheetStates.MID))
						},
					}}
				/>
			))}
			{userLocation && (
				<Marker
					icon={myLocationIcon}
					position={[userLocation.coords.latitude, userLocation.coords.longitude]}
				/>
			)}
		</>
	)
}
