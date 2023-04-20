import React, { useEffect, useState } from 'react'
import * as maptilersdk from '@maptiler/sdk'

import '@maptiler/sdk/dist/maptiler-sdk.css'
import { TMap } from '../TMap'
import { MapContainerStyled } from './Map.styled'
import { MapContent } from './MapContent'

const getMapApiKey = (): string => {
	if (process.env.MAPTILER_KEY) {
		return process.env.MAPTILER_KEY
	}

	// eslint-disable-next-line no-console
	console.error(`MAPTILER_KEY is not set`)

	return ``
}

export const Map: React.FC = () => {
	const [mapExt, setMapExt] = useState<TMap>(undefined)

	useEffect(() => {
		maptilersdk.config.apiKey = getMapApiKey()

		const map = new maptilersdk.Map({
			style: maptilersdk.MapStyle.STREETS,
			center: [84.899966, 56.47177],
			zoom: 15.5,
			pitch: 45,
			bearing: 60,
			container: `map`,
			antialias: true,
			geolocateControl: false,
			scaleControl: false,
			terrainControl: false,
			navigationControl: false,
		})

		map.on(`load`, () => {
			// Insert the layer beneath any symbol layer.
			const { layers } = map.getStyle()

			let labelLayerId
			for (let i = 0; i < layers.length; i++) {
				if (layers[i].type === `symbol` && layers[i].layout[`text-field`]) {
					labelLayerId = layers[i].id
					break
				}
			}

			map.addLayer(
				{
					id: `3d-buildings`,
					source: `openmaptiles`,
					'source-layer': `building`,
					filter: [`==`, `extrude`, `true`],
					type: `fill-extrusion`,
					minzoom: 15,
					paint: {
						'fill-extrusion-color': `#aaa`,

						// use an 'interpolate' expression to add a smooth transition effect to the
						// buildings as the user zooms in
						'fill-extrusion-height': [`interpolate`, [`linear`], [`zoom`], 15, 0, 15.05, [`get`, `height`]],
						'fill-extrusion-base': [
							`interpolate`,
							[`linear`],
							[`zoom`],
							15,
							0,
							15.05,
							[`get`, `min_height`],
						],
						'fill-extrusion-opacity': 0.6,
					},
				},
				labelLayerId,
			)
		})

		setMapExt(map)
	}, [])

	return (
		<MapContainerStyled id="map">
			<MapContent map={mapExt} />
		</MapContainerStyled>
	)
}
