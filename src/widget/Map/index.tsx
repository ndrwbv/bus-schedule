import React, { useEffect, useMemo, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import { useDispatch, useSelector } from 'react-redux'
import { BottomSheetStates, setBottomSheetPosition } from 'features/BottomSheet/model/bottomSheetSlice'
import { LatLngExpression } from 'leaflet'
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

const GeoLocationStyled = styled.div`
	width: 20px;
	height: 20px;
	background-color: red;
	border-radius: 50%;
`
const STOPS_WITH_COORDS = STOPS.filter(
	(stop: IStops<DirectionsNew.in> | IStops<DirectionsNew.out>) => stop.latLon !== null,
)

const MapContent: React.FC = () => {
	const map = useMap()
	const busStop = useSelector(busStopNewSelector)
	const dispath = useDispatch()

	useEffect(() => {
		if (busStop && busStop.latLon) {
			map.flyTo(busStop.latLon, 18)
		}
	}, [busStop, map])

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
		</>
	)
}

export const Map: React.FC = () => {
	const [mapCenter, setMapCenter] = useState<LatLngExpression>([56.47177, 84.899966])

	return (
		<MapStyled center={mapCenter} zoom={15} zoomControl={false} scrollWheelZoom>
			<TileLayer
				attribution="google"
				url="http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}"
				subdomains={[`mt0`, `mt1`, `mt2`, `mt3`]}
				updateWhenIdle={false}
			/>

			<MapContent />
			<GeoLocationStyled />
		</MapStyled>
	)
}
