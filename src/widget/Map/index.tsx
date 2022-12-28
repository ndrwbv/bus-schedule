import React, { useEffect } from 'react'
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import { useDispatch, useSelector } from 'react-redux'
import { BottomSheetStates, setBottomSheetPosition } from 'features/BottomSheet/model/bottomSheetSlice'
import { userLocationSelector } from 'features/Geolocation/model/myLocationSlice'
import { busStopNewSelector, setBusStopNew } from 'shared/store/busStop/busStopInfoSlice'
import { STOPS } from 'shared/store/busStop/const/stops'
import { DirectionsNew, IStops } from 'shared/store/busStop/Stops'
import styled from 'styled-components'

import 'leaflet/dist/leaflet.css'

const MapStyled = styled(MapContainer)`
	z-index: 1;
	height: 100vh;
	width: 100vw;
`

const STOPS_WITH_COORDS = STOPS.filter(
	(stop: IStops<DirectionsNew.in> | IStops<DirectionsNew.out>) => stop.latLon !== null,
)

const MapContent: React.FC = () => {
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
		if (busStop && busStop.latLon) {
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
			{STOPS_WITH_COORDS.map(stop => (
				<Marker
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
			{userLocation && <Marker position={[userLocation.coords.latitude, userLocation.coords.longitude]} />}
		</>
	)
}

const MAP_CENTER_DEFAULT = [56.47177, 84.899966]
export const Map: React.FC = () => {
	return (
		<MapStyled center={MAP_CENTER_DEFAULT} zoom={15} zoomControl={false} scrollWheelZoom>
			<TileLayer
				attribution="google"
				url="http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}"
				subdomains={[`mt0`, `mt1`, `mt2`, `mt3`]}
				updateWhenIdle={false}
			/>

			<MapContent />
		</MapStyled>
	)
}
