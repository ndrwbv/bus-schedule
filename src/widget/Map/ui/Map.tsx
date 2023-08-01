import React, { useEffect, useState } from 'react'
import * as maptilersdk from '@maptiler/sdk'

import '@maptiler/sdk/dist/maptiler-sdk.css'
import { TMap } from '../TMap'
import { MapContainerStyled } from './Map.styled'
import { MapContent } from './MapContent'

const getMapApiKey = (attempt: number): string => {
	console.info(`trying MAPTILER_KEY_${attempt}`)

	if (process.env[`MAPTILER_KEY_${attempt}`]) {
		return process.env[`MAPTILER_KEY_${attempt}`] ?? ``
	}

	// eslint-disable-next-line no-console
	console.info(`MAPTILER_KEY is not set. Attempt: `, attempt)

	return ``
}

const MAX_KEY_AMOUNT = 10
const KEY_START_INDEX = 1
export const Map: React.FC = () => {
	const [mapExt, setMapExt] = useState<TMap>(undefined)
	const [mapApiKeyIndex, setMapApiKeyIndex] = useState(KEY_START_INDEX)

	useEffect(() => {
		maptilersdk.config.apiKey = getMapApiKey(mapApiKeyIndex)

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
			maptilerLogo: false,
			logoPosition: undefined,
		}).on(`error`, e => {
			if (mapApiKeyIndex === MAX_KEY_AMOUNT) {
				console.log(`MAX_KEY_AMOUNT exceeded`)

				return
			}

			setMapApiKeyIndex(prev => prev + 1)
		})

		setMapExt(map)
	}, [mapApiKeyIndex])

	return (
		<MapContainerStyled id="map">
			<MapContent map={mapExt} />
		</MapContainerStyled>
	)
}
