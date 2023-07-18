import React, { useEffect, useState } from 'react'
import * as maptilersdk from '@maptiler/sdk'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

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

		// parameters to ensure the model is georeferenced correctly on the map
		const modelOrigin = [84.899966, 56.47177]
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
				const helper1 = new THREE.DirectionalLightHelper(directionalLight, 10)
				this.scene.add(directionalLight)
				this.scene.add(helper1)

				const directionalLight2 = new THREE.DirectionalLight(0xffffff)
				directionalLight2.position.set(0, 100, 0).normalize()

				const helper = new THREE.DirectionalLightHelper(directionalLight2)
				
				this.scene.add(directionalLight2)
				this.scene.add(helper)

				const light = new THREE.AmbientLight(0xffffff, 0.5)
				this.scene.add(light)
				// use the three.js GLTF loader to add the 3D model to the three.js scene
				const loader = new GLTFLoader()

				loader.load(
					`/cup/scene_glb.glb`,
					function (gltf) {
						gltf.scene.scale.set(100, 100, 100)

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
			<MapContent map={mapExt} />
		</MapContainerStyled>
	)
}
