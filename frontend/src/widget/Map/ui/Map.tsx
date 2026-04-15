import React, { useCallback, useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'

import 'maplibre-gl/dist/maplibre-gl.css'
import { MAP_STYLE_URL } from '../mapProvider'
import { TMap } from '../TMap'
import { MapContainerStyled } from './Map.styled'
import { MapContent } from './MapContent'
import { MapLoader } from './MapLoader'

const LOAD_TIMEOUT_MS = 15000

const isWebGLSupported = (): boolean => {
	try {
		const canvas = document.createElement(`canvas`)
		const gl = canvas.getContext(`webgl2`) || canvas.getContext(`webgl`) || canvas.getContext(`experimental-webgl`)

		return Boolean(gl)
	} catch {
		return false
	}
}

export const Map: React.FC = () => {
	const [mapExt, setMapExt] = useState<TMap>(undefined)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [reloadKey, setReloadKey] = useState(0)
	const mapRef = useRef<maplibregl.Map | null>(null)

	const handleRetry = useCallback(() => {
		setError(null)
		setLoading(true)
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

		let loaded = false

		let map: maplibregl.Map
		try {
			map = new maplibregl.Map({
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
		} catch (e) {
			const message = e instanceof Error ? e.message : String(e)
			// eslint-disable-next-line no-console
			console.error(`[Map] Failed to initialize:`, e)
			setError(`Ошибка инициализации: ${message}`)
			setLoading(false)

			return undefined
		}

		map.on(`load`, () => {
			loaded = true
			// Hide all map text labels (street names, POIs, etc.)
			const keepLayers = new Set(['ad-banner-layer', 'livebus-icon'])
			for (const layer of map.getStyle().layers) {
				if (layer.type === 'symbol' && !keepLayers.has(layer.id)) {
					map.setLayoutProperty(layer.id, 'visibility', 'none')
				}
			}

			setError(null)
			setLoading(false)
		})

		map.on(`error`, e => {
			const err = e as unknown as { error?: Error; message?: string }
			// eslint-disable-next-line no-console
			console.error(`[Map] error event:`, err.error ?? err)

			// Tile-level errors shouldn't block the whole map if it already rendered
			if (loaded) return

			const raw = err.error?.message || err.message || `неизвестная ошибка`
			setError(raw)
			setLoading(false)
		})

		// Fallback: on some mobile browsers load event doesn't fire in a timely manner
		const timeout = setTimeout(() => {
			if (loaded) return
			// eslint-disable-next-line no-console
			console.error(`[Map] load timeout after ${LOAD_TIMEOUT_MS}ms`)
			setError(`Превышено время ожидания (${LOAD_TIMEOUT_MS / 1000} с). Проверьте подключение к интернету.`)
			setLoading(false)
		}, LOAD_TIMEOUT_MS)

		mapRef.current = map
		setMapExt(map)

		return () => {
			clearTimeout(timeout)
			map.remove()
			mapRef.current = null
		}
	}, [reloadKey])

	return (
		<MapContainerStyled id="map">
			<MapLoader loading={loading} error={error} onRetry={handleRetry} />
			<MapContent map={mapExt} mapLoaded={!loading && !error} />
		</MapContainerStyled>
	)
}
