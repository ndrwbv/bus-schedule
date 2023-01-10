import React, { useEffect } from 'react'
import { Marker, useMap, useMapEvents } from 'react-leaflet'
import { useDispatch, useSelector } from 'react-redux'
import { BottomSheetStates, setBottomSheetPosition } from 'features/BottomSheet/model/bottomSheetSlice'
import { userLocationSelector } from 'features/MyLocation/model/myLocationSlice'
import { busStopNewSelector, setBusStopNew } from 'shared/store/busStop/busStopInfoSlice'
import { STOPS } from 'shared/store/busStop/const/stops'

import { myLocationIcon, stopIcon } from './styled'

export const MapContent: React.FC = () => {
	const map = useMap()
	const dispath = useDispatch()
	const busStop = useSelector(busStopNewSelector)
	const userLocation = useSelector(userLocationSelector)

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
					icon={stopIcon}
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
