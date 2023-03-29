import React, { useEffect } from 'react'
import { Marker, useMap, useMapEvents } from 'react-leaflet'
import { useDispatch, useSelector } from 'react-redux'
import { BottomSheetStates, setBottomSheetPosition } from 'features/BottomSheet/model/bottomSheetSlice'
import { userLocationSelector } from 'features/MyLocation/model/myLocationSlice'
import L from 'leaflet'
import { busStopNewSelector, setBusStopNew } from 'shared/store/busStop/busStopInfoSlice'
import { STOPS } from 'shared/store/busStop/const/stops'
import { leftSelector } from 'shared/store/timeLeft/timeLeftSlice'

import { pinIcon } from './icon'
import { myLocationIcon } from './styled'

// Если зум N взять остановки рядом и начать считать для них время
// Если зум/тач то эти остановки сбрасываются
// По умолчанию показывают сокращенное название остановки
// Добавить слежение за геолокацией и тогда перерисовывать на ходу

export const MapContent: React.FC = () => {
	const map = useMap()
	const dispath = useDispatch()
	const busStop = useSelector(busStopNewSelector)
	const userLocation = useSelector(userLocationSelector)
	const left = useSelector(leftSelector)
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
			{STOPS.map(stop => (
				<Marker
					icon={L.divIcon({
						html: pinIcon(`GREEN`),
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
