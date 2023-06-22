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
			maptilerLogo: false,
			logoPosition: undefined,
		})

		setMapExt(map)
	}, [])

	return (
		<MapContainerStyled id="map">
			<MapContent map={mapExt} />
		</MapContainerStyled>
	)
}
