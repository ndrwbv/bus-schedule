import React from 'react'
import 'leaflet/dist/leaflet.css'

import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import styled from 'styled-components'

const Wrapper = styled.div`
	position: absolute;
	top: 0;
	left: 0;
`
const MapStyled = styled(MapContainer)`
	height: 100vh;
	width: 100vw;
`

export const Map = () => {
	return (
		<Wrapper>
			<MapStyled center={[51.505, -0.09]} zoom={13} scrollWheelZoom={false}>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>
				<Marker position={[51.505, -0.09]}>
					<Popup>
						A pretty CSS3 popup. <br /> Easily customizable.
					</Popup>
				</Marker>
			</MapStyled>
		</Wrapper>
	)
}
