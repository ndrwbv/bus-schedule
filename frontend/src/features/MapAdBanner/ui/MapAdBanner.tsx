import React, { useCallback, useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import { AndrewLytics } from 'shared/lib'
import { BannerMessage, useGetBannerMessagesQuery } from 'shared/api/scheduleApi'

import { TMap } from 'widget/Map/TMap'

import styles from './MapAdBanner.module.css'
import { MapAdBannerModal } from './MapAdBannerModal'

const BANNER_COORDS: [number, number] = [84.909514, 56.462506]
const ROTATION_INTERVAL = 6000
const FADE_DURATION = 500
const SOURCE_ID = 'ad-banner-source'
const LAYER_ID = 'ad-banner-layer'
const IMAGE_ID = 'ad-banner-image'
const CANVAS_W = 240
const CANVAS_H = 132

const DEFAULT_MESSAGES: BannerMessage[] = [
	{ id: -1, author_name: ``, message: `Продам опель астра`, created_at: `` },
	{ id: -2, author_name: ``, message: `Ищу девушку с остановки`, created_at: `` },
	{ id: -3, author_name: ``, message: `Хочу лето`, created_at: `` },
	{ id: -4, author_name: ``, message: `Сделай мне ням-ням`, created_at: `` },
]

function renderBannerCanvas(text: string, opacity: number): HTMLCanvasElement {
	const canvas = document.createElement('canvas')
	canvas.width = CANVAS_W
	canvas.height = CANVAS_H
	const ctx = canvas.getContext('2d')!

	// Board background
	const boardH = 88
	const boardY = 0
	const radius = 12

	// Rounded rect
	ctx.beginPath()
	ctx.moveTo(radius, boardY)
	ctx.lineTo(CANVAS_W - radius, boardY)
	ctx.quadraticCurveTo(CANVAS_W, boardY, CANVAS_W, boardY + radius)
	ctx.lineTo(CANVAS_W, boardY + boardH - radius)
	ctx.quadraticCurveTo(CANVAS_W, boardY + boardH, CANVAS_W - radius, boardY + boardH)
	ctx.lineTo(radius, boardY + boardH)
	ctx.quadraticCurveTo(0, boardY + boardH, 0, boardY + boardH - radius)
	ctx.lineTo(0, boardY + radius)
	ctx.quadraticCurveTo(0, boardY, radius, boardY)
	ctx.closePath()

	ctx.fillStyle = '#ffffff'
	ctx.fill()
	ctx.strokeStyle = '#336CFF'
	ctx.lineWidth = 4
	ctx.stroke()

	// Text
	ctx.globalAlpha = opacity
	ctx.fillStyle = '#333333'
	ctx.textAlign = 'center'
	ctx.textBaseline = 'middle'

	// Auto-size text to fit
	let fontSize = 22
	const maxWidth = CANVAS_W - 24
	ctx.font = `500 ${fontSize}px sans-serif`
	while (ctx.measureText(text).width > maxWidth && fontSize > 11) {
		fontSize--
		ctx.font = `500 ${fontSize}px sans-serif`
	}

	// Truncate if still too wide
	let displayText = text
	if (ctx.measureText(displayText).width > maxWidth) {
		while (ctx.measureText(displayText + '...').width > maxWidth && displayText.length > 0) {
			displayText = displayText.slice(0, -1)
		}
		displayText += '...'
	}

	ctx.fillText(displayText, CANVAS_W / 2, boardY + boardH / 2)
	ctx.globalAlpha = 1

	// Pole
	const poleW = 6
	const poleH = 28
	const poleX = (CANVAS_W - poleW) / 2
	const poleY = boardH
	ctx.fillStyle = '#999999'
	ctx.fillRect(poleX, poleY, poleW, poleH)

	// Foot
	const footW = 32
	const footH = 8
	const footX = (CANVAS_W - footW) / 2
	const footY = poleY + poleH
	ctx.beginPath()
	ctx.moveTo(footX + 4, footY)
	ctx.lineTo(footX + footW - 4, footY)
	ctx.quadraticCurveTo(footX + footW, footY, footX + footW, footY + 4)
	ctx.lineTo(footX + footW, footY + footH - 4)
	ctx.quadraticCurveTo(footX + footW, footY + footH, footX + footW - 4, footY + footH)
	ctx.lineTo(footX + 4, footY + footH)
	ctx.quadraticCurveTo(footX, footY + footH, footX, footY + footH - 4)
	ctx.lineTo(footX, footY + 4)
	ctx.quadraticCurveTo(footX, footY, footX + 4, footY)
	ctx.closePath()
	ctx.fillStyle = '#aaaaaa'
	ctx.fill()

	return canvas
}

export const MapAdBanner: React.FC<{ map: TMap; mapLoaded: boolean }> = ({ map, mapLoaded }) => {
	const { data } = useGetBannerMessagesQuery(undefined, { pollingInterval: 60_000 })
	const [modalOpen, setModalOpen] = useState(false)
	const [currentIndex, setCurrentIndex] = useState(0)
	const [opacity, setOpacity] = useState(1)
	const layerReady = useRef(false)

	const messages = data?.messages?.length ? data.messages : DEFAULT_MESSAGES

	// Rotate messages with fade
	useEffect(() => {
		if (messages.length <= 1) return undefined

		const interval = setInterval(() => {
			setOpacity(0)

			setTimeout(() => {
				setCurrentIndex(prev => (prev + 1) % messages.length)
				setOpacity(1)
			}, FADE_DURATION)
		}, ROTATION_INTERVAL)

		return () => clearInterval(interval)
	}, [messages.length])

	useEffect(() => {
		setCurrentIndex(0)
	}, [messages.length])

	const handleOpen = useCallback(() => {
		setModalOpen(true)
		AndrewLytics(`mapAdBanner.open`)
	}, [])

	const handleClose = useCallback(() => {
		setModalOpen(false)
	}, [])

	// Setup source + layer once
	useEffect(() => {
		if (!map || !mapLoaded) return undefined

		const canvas = renderBannerCanvas(DEFAULT_MESSAGES[0].message, 1)
		const imgData = map.getImage(IMAGE_ID)

		if (!imgData) {
			map.addImage(IMAGE_ID, { width: CANVAS_W, height: CANVAS_H, data: new Uint8Array(canvas.getContext('2d')!.getImageData(0, 0, CANVAS_W, CANVAS_H).data) })
		}

		if (!map.getSource(SOURCE_ID)) {
			map.addSource(SOURCE_ID, {
				type: 'geojson',
				data: {
					type: 'FeatureCollection',
					features: [{
						type: 'Feature',
						geometry: { type: 'Point', coordinates: BANNER_COORDS },
						properties: {},
					}],
				},
			})
		}

		if (!map.getLayer(LAYER_ID)) {
			map.addLayer({
				id: LAYER_ID,
				type: 'symbol',
				source: SOURCE_ID,
				layout: {
					'icon-image': IMAGE_ID,
					'icon-size': 0.5,
					'icon-anchor': 'bottom',
					'icon-allow-overlap': true,
					'icon-ignore-placement': true,
				},
			})
		}

		layerReady.current = true

		const onClick = (e: maplibregl.MapMouseEvent): void => {
			const features = map.queryRenderedFeatures(e.point, { layers: [LAYER_ID] })
			if (features.length > 0) {
				handleOpen()
			}
		}

		const onMouseEnter = (): void => {
			map.getCanvas().style.cursor = 'pointer'
		}

		const onMouseLeave = (): void => {
			map.getCanvas().style.cursor = ''
		}

		map.on('click', LAYER_ID, onClick)
		map.on('mouseenter', LAYER_ID, onMouseEnter)
		map.on('mouseleave', LAYER_ID, onMouseLeave)

		return () => {
			map.off('click', LAYER_ID, onClick)
			map.off('mouseenter', LAYER_ID, onMouseEnter)
			map.off('mouseleave', LAYER_ID, onMouseLeave)

			try {
				if (map.getLayer(LAYER_ID)) map.removeLayer(LAYER_ID)
				if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID)
				if (map.getImage(IMAGE_ID)) map.removeImage(IMAGE_ID)
			} catch {
				// map may be destroyed
			}

			layerReady.current = false
		}
	}, [map, mapLoaded, handleOpen])

	// Update image when text or opacity changes
	useEffect(() => {
		if (!map || !layerReady.current) return

		const current = messages[currentIndex % messages.length]
		const canvas = renderBannerCanvas(current?.message ?? '', opacity)
		const imageData = canvas.getContext('2d')!.getImageData(0, 0, CANVAS_W, CANVAS_H)

		try {
			map.removeImage(IMAGE_ID)
			map.addImage(IMAGE_ID, { width: CANVAS_W, height: CANVAS_H, data: new Uint8Array(imageData.data) })
		} catch {
			// ignore if map destroyed
		}
	}, [map, currentIndex, opacity, messages])

	return (
		<MapAdBannerModal
			isOpen={modalOpen}
			onClose={handleClose}
			messages={messages.filter(m => m.id > 0)}
		/>
	)
}
