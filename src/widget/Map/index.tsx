import React from 'react'
import 'leaflet/dist/leaflet.css'

import { MapContainer, TileLayer } from 'react-leaflet'
import styled from 'styled-components'

const MapStyled = styled(MapContainer)`
	z-index: 1;
	height: 100vh;
	width: 100vw;
`

export const Map = () => {
	return (
		<MapStyled center={[51.505, -0.09]} zoom={13} zoomControl={false} scrollWheelZoom={false}>
			<TileLayer
				attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
			/>
		</MapStyled>
	)
}
