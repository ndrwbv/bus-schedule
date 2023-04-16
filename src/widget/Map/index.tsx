import React, { useEffect, useState } from 'react'
import { TileLayer } from 'react-leaflet'
import * as maptilersdk from '@maptiler/sdk'
import * as THREE from 'three'

// import 'leaflet.markercluster'
// import 'leaflet/dist/leaflet.css'
import '@maptiler/sdk/dist/maptiler-sdk.css'
import { MapContent } from './MapContent'
import { MapContentTiler } from './MapContentTiler'
import { MapContainerStyled, MapStyled } from './styled'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

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
			center: [148.9819, -35.3981],
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

		// parameters to ensure the model is georeferenced correctly on the map
		const modelOrigin = [148.9819, -35.39847]
		const modelAltitude = 0
		const modelRotate = [Math.PI / 2, 0, 0]

		const modelAsMercatorCoordinate = maptilersdk.MercatorCoordinate.fromLngLat(modelOrigin, modelAltitude)

		// transformation parameters to position, rotate and scale the 3D model onto the map
		const modelTransform = {
			translateX: modelAsMercatorCoordinate.x,
			translateY: modelAsMercatorCoordinate.y,
			translateZ: modelAsMercatorCoordinate.z,
			rotateX: modelRotate[0],
			rotateY: modelRotate[1],
			rotateZ: modelRotate[2],
			/* Since our 3D model is in real world meters, a scale transform needs to be
			 * applied since the CustomLayerInterface expects units in MercatorCoordinates.
			 */
			scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits(),
		}

		// configuration of the custom layer for a 3D model per the CustomLayerInterface
		const customLayer = {
			id: `3d-model`,
			type: `custom`,
			renderingMode: `3d`,
			onAdd(map, gl) {
				this.camera = new THREE.Camera()
				this.scene = new THREE.Scene()

				// create two three.js lights to illuminate the model
				const directionalLight = new THREE.DirectionalLight(0xffffff)
				directionalLight.position.set(0, -70, 100).normalize()
				this.scene.add(directionalLight)

				const directionalLight2 = new THREE.DirectionalLight(0xffffff)
				directionalLight2.position.set(0, 70, 100).normalize()
				this.scene.add(directionalLight2)

				// use the three.js GLTF loader to add the 3D model to the three.js scene
				const loader = new GLTFLoader()
				loader.load(
					`https://docs.maptiler.com/sdk-js/assets/34M_17/34M_17.gltf`,
					function (gltf) {
						this.scene.add(gltf.scene)
					}.bind(this),
				)
				this.map = map

				// use the map canvas for three.js
				this.renderer = new THREE.WebGLRenderer({
					canvas: map.getCanvas(),
					context: gl,
					antialias: true,
				})

				this.renderer.autoClear = false
			},
			render(gl, matrix) {
				const rotationX = new THREE.Matrix4().makeRotationAxis(
					new THREE.Vector3(1, 0, 0),
					modelTransform.rotateX,
				)
				const rotationY = new THREE.Matrix4().makeRotationAxis(
					new THREE.Vector3(0, 1, 0),
					modelTransform.rotateY,
				)
				const rotationZ = new THREE.Matrix4().makeRotationAxis(
					new THREE.Vector3(0, 0, 1),
					modelTransform.rotateZ,
				)

				const m = new THREE.Matrix4().fromArray(matrix)
				const l = new THREE.Matrix4()
					.makeTranslation(modelTransform.translateX, modelTransform.translateY, modelTransform.translateZ)
					.scale(new THREE.Vector3(modelTransform.scale, -modelTransform.scale, modelTransform.scale))
					.multiply(rotationX)
					.multiply(rotationY)
					.multiply(rotationZ)

				this.camera.projectionMatrix = m.multiply(l)
				this.renderer.state.reset()
				this.renderer.render(this.scene, this.camera)
				this.map.triggerRepaint()
			},
		}

		map.on(`style.load`, function () {
			map.addLayer(customLayer)
		})

		setMapExt(map)
	}, [])

	return (
		<MapContainerStyled id="map">
			<MapContentTiler map={mapExt} />
		</MapContainerStyled>
	)
}
