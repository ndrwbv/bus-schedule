import React, { useEffect, useState } from 'react'
import { TileLayer } from 'react-leaflet'
import * as maptilersdk from '@maptiler/sdk'

// import 'leaflet.markercluster'
// import 'leaflet/dist/leaflet.css'
import '@maptiler/sdk/dist/maptiler-sdk.css'
import { MapContent } from './MapContent'
import { MapContentTiler } from './MapContentTiler'
import { MapContainerStyled, MapStyled } from './styled'

const MAP_CENTER_DEFAULT = { lat: 56.47177, lng: 84.899966 }

// export const Map: React.FC = () => {
// 	return (
// 		<MapStyled center={MAP_CENTER_DEFAULT} zoom={15} zoomControl={false} scrollWheelZoom>
// 			<TileLayer
// 				attribution="google"
// 				url="https://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}"
// 				subdomains={[`mt0`, `mt1`, `mt2`, `mt3`]}
// 				updateWhenIdle={false}
// 			/>

// 			<MapContent />
// 		</MapStyled>
// 	)
// }

export const Map: React.FC = () => {
	const [mapExt, setMapExt] = useState()

	useEffect(() => {
		maptilersdk.config.apiKey = `5Xhs9YSiyuBcOhzdQscW`

		const map = new maptilersdk.Map({
			style: maptilersdk.MapStyle.STREETS,
			center: [84.899966, 56.47177], // starting position [lng, lat]
			zoom: 15.5,
			pitch: 45,
			bearing: -17.6,
			container: `map`,
			antialias: true,
		})

		// The 'building' layer in the streets vector source contains building-height
		// data from OpenStreetMap.
		map.on(`load`, function () {
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
			<MapContentTiler map={mapExt} />
		</MapContainerStyled>
	)
}
