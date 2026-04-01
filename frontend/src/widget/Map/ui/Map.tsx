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
	const [debugLog, setDebugLog] = useState<string[]>([])
	const mapRef = useRef<maplibregl.Map | null>(null)

	const addLog = (msg: string): void => {
		setDebugLog(prev => [...prev, `${Math.round(performance.now())}ms: ${msg}`])
	}

	useEffect(() => {
		if (mapRef.current) {
			mapRef.current.remove()
			mapRef.current = null
		}

		addLog(`creating map`)

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

		addLog(`map created, isStyleLoaded=${map.isStyleLoaded()}`)

		map.on(`load`, () => {
			addLog(`load event`)
			setLoading(false)
		})

		map.on(`idle`, () => {
			addLog(`idle event`)
		})

		map.on(`error`, (e) => {
			addLog(`error: ${JSON.stringify(e.error?.message ?? e)}`)
			setError(`Не удалось загрузить карту`)
			setLoading(false)
		})

		map.on(`data`, (e: any) => {
			if (e.dataType === `style`) {
				addLog(`style data event`)
			}
		})

		// If style already loaded by the time we subscribe
		if (map.isStyleLoaded()) {
			addLog(`already loaded`)
			setLoading(false)
		}

		// Fallback: hide loader after 10s regardless
		const timeout = setTimeout(() => {
			addLog(`timeout 10s`)
			setLoading(false)
		}, 10000)

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
			<MapLoader loading={loading} error={error} debugLog={debugLog} />
			<MapContent map={mapExt} mapLoaded={!loading} />
		</MapContainerStyled>
	)
}
