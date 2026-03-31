import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import maplibregl from 'maplibre-gl'
import { mapProviderSelector } from 'features/Settings/model/settingsSlice'

import 'maplibre-gl/dist/maplibre-gl.css'
import { getStyleUrl } from '../mapProvider'
import { TMap } from '../TMap'
import { MapContainerStyled } from './Map.styled'
import { MapContent } from './MapContent'

const MAX_KEY_AMOUNT = 10
const KEY_START_INDEX = 1

export const Map: React.FC = () => {
	const [mapExt, setMapExt] = useState<TMap>(undefined)
	const [mapApiKeyIndex, setMapApiKeyIndex] = useState(KEY_START_INDEX)
	const mapProvider = useSelector(mapProviderSelector)
	const mapRef = useRef<maplibregl.Map | null>(null)

	useEffect(() => {
		// Destroy previous map instance if provider or key changed
		if (mapRef.current) {
			mapRef.current.remove()
			mapRef.current = null
		}

		const styleUrl = getStyleUrl(mapProvider, mapApiKeyIndex)

		const map = new maplibregl.Map({
			style: styleUrl,
			center: [84.899966, 56.47177],
			zoom: 15.5,
			pitch: 45,
			bearing: 60,
			container: `map`,
			antialias: true,
			attributionControl: true,
		})

		map.on(`error`, () => {
			if (mapProvider === `maptiler` && mapApiKeyIndex < MAX_KEY_AMOUNT) {
				setMapApiKeyIndex(prev => prev + 1)
			}
		})

		mapRef.current = map
		setMapExt(map)

		return () => {
			map.remove()
			mapRef.current = null
		}
	}, [mapApiKeyIndex, mapProvider])

	return (
		<MapContainerStyled id="map">
			<MapContent map={mapExt} />
		</MapContainerStyled>
	)
}
