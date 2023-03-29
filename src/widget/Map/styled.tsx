import { MapContainer } from 'react-leaflet'
import L from 'leaflet'
import styled from 'styled-components'

import MyLocationSVG from './mylocation.svg'
import StopSVG from './stop.svg'

export const stopIcon = new L.Icon({
	iconUrl: StopSVG,
	iconRetinaUrl: StopSVG,
	iconSize: new L.Point(90, 90),
})
export const myLocationIcon = new L.Icon({
	iconUrl: MyLocationSVG,
	iconRetinaUrl: MyLocationSVG,
	iconSize: new L.Point(50, 50),
})
export const MapStyled = styled(MapContainer)`
	z-index: 1;
	height: 100vh;
	width: 100vw;
`
