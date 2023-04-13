import React from 'react'
import { TileLayer } from 'react-leaflet'

import 'leaflet.markercluster'
import 'leaflet/dist/leaflet.css'
import { MapContent } from './MapContent'
import { MapStyled } from './styled'

const MAP_CENTER_DEFAULT = { lat: 56.47177, lng: 84.899966 }

export const Map: React.FC = () => {
	return (
		<MapStyled center={MAP_CENTER_DEFAULT} zoom={15} zoomControl={false} scrollWheelZoom>
			<TileLayer
				attribution="google"
				url="https://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}"
				subdomains={[`mt0`, `mt1`, `mt2`, `mt3`]}
				updateWhenIdle={false}
			/>

			<MapContent />
		</MapStyled>
	)
}
