import React, { useMemo, useState } from 'react'
import { MapContainer, Marker, TileLayer } from 'react-leaflet'
import { useSelector } from 'react-redux'
import { LatLngExpression } from 'leaflet'
import { busStopNewSelector } from 'shared/store/busStop/busStopInfoSlice'
import { STOPS } from 'shared/store/busStop/const/stops'
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
const STOPS_WITH_COORDS = STOPS.filter(stop => stop.latLon !== null)

export const Map: React.FC = () => {
	const [mapCenter, setMapCenter] = useState<LatLngExpression>([56.47177, 84.899966])
	const busStop = useSelector(busStopNewSelector)
console.log(STOPS_WITH_COORDS)
	return (
		<MapStyled center={mapCenter} zoom={15} zoomControl={false} scrollWheelZoom>
			<TileLayer
				attribution="google"
				url="http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}"
				subdomains={[`mt0`, `mt1`, `mt2`, `mt3`]}
				updateWhenIdle={false}
			/>

			{STOPS_WITH_COORDS.map(stop => (
				<Marker
					position={stop.latLon}
					eventHandlers={{
						click: e => {
							console.log(`marker clicked`, e)
							setMapCenter(e.latlng)
						},
					}}
				/>
			))}
			<GeoLocationStyled />
		</MapStyled>
	)
}
