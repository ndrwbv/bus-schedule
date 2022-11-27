import React, { useState } from 'react'
import { MapContainer, Marker, TileLayer } from 'react-leaflet'
import { LatLngExpression } from 'leaflet'
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

			<Marker
				position={[56.47177, 84.899966]}
				eventHandlers={{
					click: e => {
						console.log(`marker clicked`, e)
						setMapCenter(e.latlng)
					},
				}}
			/>
			<GeoLocationStyled />
		</MapStyled>
	)
}
