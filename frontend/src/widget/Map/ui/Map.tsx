import React, { useCallback, useEffect, useRef, useState } from 'react'
import * as maplibregl from 'maplibre-gl'
// maplibre 6 loads its worker from a file next to its own bundle, which Vite doesn't copy. `?worker&url`
// bundles the worker with its imports into one file and gives us its URL
// eslint-disable-next-line import/extensions -- the file name, not an extension to drop
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import { Protocol } from 'pmtiles'

import 'maplibre-gl/dist/maplibre-gl.css'
import { watchMapLoading } from '../mapLoading'
import { MAP_FALLBACK_STYLE_URL, MAP_STYLE_URL } from '../mapProvider'
import { TMap } from '../TMap'
import { MapContainerStyled } from './Map.styled'
import { MapContent } from './MapContent'
import { MapLoader } from './MapLoader'

maplibregl.setWorkerUrl(maplibreWorkerUrl)

// Register PMTiles protocol for self-hosted vector tiles
const pmtilesProtocol = new Protocol()
maplibregl.addProtocol(`pmtiles`, pmtilesProtocol.tile)

const isWebGLSupported = (): boolean => {
	try {
		const canvas = document.createElement(`canvas`)
		// maplibre 6 dropped WebGL 1: without WebGL 2 the map can't render, show the fallback instead
		const gl = canvas.getContext(`webgl2`)

		return Boolean(gl)
	} catch {
		return false
	}
}

export const Map: React.FC = () => {
	const [mapExt, setMapExt] = useState<TMap>(undefined)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [usingFallback, setUsingFallback] = useState(false)
	const [styleReady, setStyleReady] = useState(false)
	const [reloadKey, setReloadKey] = useState(0)
	const mapRef = useRef<maplibregl.Map | null>(null)

	const handleRetry = useCallback(() => {
		setError(null)
		setLoading(true)
		setUsingFallback(false)
		setStyleReady(false)
		setReloadKey(k => k + 1)
	}, [])

	useEffect(() => {
		if (mapRef.current) {
			mapRef.current.remove()
			mapRef.current = null
		}

		if (!isWebGLSupported()) {
			// eslint-disable-next-line no-console
			console.error(`[Map] WebGL is not supported in this browser`)
			setError(`Ваш браузер не поддерживает WebGL`)
			setLoading(false)

			return undefined
		}

		setStyleReady(false)
		setLoading(true)
		setError(null)

		let map: maplibregl.Map
		try {
			map = new maplibregl.Map({
				style: usingFallback ? MAP_FALLBACK_STYLE_URL : MAP_STYLE_URL,
				center: [84.899966, 56.47177],
				zoom: 15.5,
				// Self-hosted pmtiles содержит только bbox Томска (84.75-85.10, 56.35-56.55).
				// За пределами bbox данных нет, и на низких zoom большой water polygon
				// перекрывает всё — выглядит будто город в воде. Ограничиваем камеру
				// city-level (~zoom 11) и не даём улететь от Томска. maxzoom тайлов 15,
				// дальше MapLibre overzoom — выше 18 теряет смысл.
				minZoom: 11,
				maxZoom: 18,
				maxBounds: [
					[84.5, 56.25],
					[85.35, 56.65],
				],
				pitch: 45,
				bearing: 60,
				container: `map`,
				attributionControl: { compact: true },
				// Since maplibre 5 WebGL context options live here (the defaults are the same, kept explicit)
				canvasContextAttributes: { antialias: false, failIfMajorPerformanceCaveat: false },
			})
		} catch (e) {
			const message = e instanceof Error ? e.message : String(e)
			// eslint-disable-next-line no-console
			console.error(`[Map] Failed to initialize:`, e)
			setError(`Ошибка инициализации: ${message}`)
			setLoading(false)

			return undefined
		}

		const stopWatching = watchMapLoading(map, !usingFallback && MAP_STYLE_URL !== MAP_FALLBACK_STYLE_URL, {
			onStyleReady: () => {
				setStyleReady(true)
				setLoading(false)
				setError(null)
				// Hide basemap labels before adding our own symbol layers.
				for (const layer of map.getStyle().layers) {
					if (layer.type === `symbol`) map.setLayoutProperty(layer.id, `visibility`, `none`)
				}
			},
			onLoaded: () => {
				setError(null)
				setLoading(false)
			},
			onFallback: () => {
				setStyleReady(false)
				setLoading(true)
				setError(null)
				setUsingFallback(true)
			},
			onError: message => {
				setError(message)
				setLoading(false)
			},
		})

		mapRef.current = map
		setMapExt(map)

		return () => {
			stopWatching()
			map.remove()
			mapRef.current = null
		}
	}, [reloadKey, usingFallback])

	return (
		<MapContainerStyled id="map">
			<MapLoader loading={loading} error={error} onRetry={handleRetry} partial={styleReady} />
			{styleReady && <MapContent key={`${reloadKey}-${usingFallback}`} map={mapExt} mapLoaded={styleReady} />}
		</MapContainerStyled>
	)
}
