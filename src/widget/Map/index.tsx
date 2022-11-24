import React from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import styled from 'styled-components'

import 'leaflet/dist/leaflet.css'

const MapStyled = styled(MapContainer)`
	z-index: 1;
	height: 100vh;
	width: 100vw;
`

export const Map: React.FC = () => {
	return (
		<MapStyled center={[56.46779, 84.90553]} zoom={15} zoomControl={false} scrollWheelZoom={false}>
			<TileLayer
				attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
			/>
		</MapStyled>
	)
}
