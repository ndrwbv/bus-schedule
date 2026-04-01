import React, { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'

import 'maplibre-gl/dist/maplibre-gl.css'
import { MAP_STYLE_URL } from '../mapProvider'
import { TMap } from '../TMap'
import { MapContainerStyled } from './Map.styled'
import { MapContent } from './MapContent'

export const Map: React.FC = () => {
	const [mapExt, setMapExt] = useState<TMap>(undefined)
	const mapRef = useRef<maplibregl.Map | null>(null)

	useEffect(() => {
		if (mapRef.current) {
			mapRef.current.remove()
			mapRef.current = null
		}

		const map = new maplibregl.Map({
			style: MAP_STYLE_URL,
			center: [84.899966, 56.47177],
			zoom: 15.5,
			pitch: 45,
			bearing: 60,
			container: `map`,
			antialias: true,
			attributionControl: false,
		})

		mapRef.current = map
		setMapExt(map)

		return () => {
			map.remove()
			mapRef.current = null
		}
	}, [])

	return (
		<MapContainerStyled id="map">
			<MapContent map={mapExt} />
		</MapContainerStyled>
	)
}
