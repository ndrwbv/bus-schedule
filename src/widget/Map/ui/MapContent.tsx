/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useCallback, useEffect } from 'react'
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

export const MapContent: React.FC<{ map: TMap }> = ({ map }) => {
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

		STOPS.forEach(stop => {
			const html = getPinContent(getCurrentTime(stop), stop.id)

			const el = document.createElement(`div`)
			el.innerHTML = html.trim()

			el.addEventListener(`click`, () => {
				handleMarkerClick(stop)
			})

			new maptilersdk.Marker(el)
				.on(`click`, () => handleMarkerClick(stop))
				.setLngLat([stop.latLon[1], stop.latLon[0]])
				.addTo(map)
		})
	}, [getCurrentTime, handleMarkerClick, map])

	useEffect(() => {
		map?.on(`dragstart`, () => {
			dispath(setBottomSheetPosition(BottomSheetStates.BOTTOM))
		})
	}, [dispath, map])

	return <GlobalStyle />
}
