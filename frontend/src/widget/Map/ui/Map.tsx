import React, { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'

import 'maplibre-gl/dist/maplibre-gl.css'
import { MAP_STYLE_URL } from '../mapProvider'
import { TMap } from '../TMap'
import { MapContainerStyled } from './Map.styled'
import { MapContent } from './MapContent'
import { MapLoader } from './MapLoader'

export const Map: React.FC = () => {
	const [mapExt, setMapExt] = useState<TMap>(undefined)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
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
			antialias: false,
			attributionControl: false,
			failIfMajorPerformanceCaveat: false,
		})

		map.on(`load`, () => {
			// Hide all map text labels (street names, POIs, etc.)
			const keepLayers = new Set(['ad-banner-layer', 'livebus-icon'])
			for (const layer of map.getStyle().layers) {
				if (layer.type === 'symbol' && !keepLayers.has(layer.id)) {
					map.setLayoutProperty(layer.id, 'visibility', 'none')
				}
			}

			setLoading(false)
		})

		map.on(`error`, () => {
			setError(`Не удалось загрузить карту`)
			setLoading(false)
		})

		// If style already loaded by the time we subscribe
		if (map.isStyleLoaded()) {
			setLoading(false)
		}

		// Fallback: on some mobile browsers load event doesn't fire
		const timeout = setTimeout(() => {
			setLoading(false)
		}, 8000)

		mapRef.current = map
		setMapExt(map)

		return () => {
			clearTimeout(timeout)
			map.remove()
			mapRef.current = null
		}
	}, [])

	return (
		<MapContainerStyled id="map">
			<MapLoader loading={loading} error={error} />
			<MapContent map={mapExt} mapLoaded={!loading && !error} />
		</MapContainerStyled>
	)
}
