import React, { useCallback, useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import { AndrewLytics } from 'shared/lib'
import { BannerMessage, useGetBannerMessagesQuery } from 'shared/api/scheduleApi'

import { TMap } from 'widget/Map/TMap'

import { MapAdBannerModal } from './MapAdBannerModal'

const BANNER_COORDS: [number, number] = [84.909514, 56.462506]
const ROTATION_INTERVAL = 6000
const FADE_DURATION = 500
const SOURCE_ID = 'ad-banner-source'
const LAYER_ID = 'ad-banner-layer'
const IMAGE_ID = 'ad-banner-img'
const CANVAS_W = 240
const CANVAS_H = 132

const DEFAULT_MESSAGES: BannerMessage[] = [
	{ id: -1, author_name: ``, message: `Продам опель астра`, amount: null, created_at: `` },
	{ id: -2, author_name: ``, message: `Ищу девушку с остановки`, amount: null, created_at: `` },
	{ id: -3, author_name: ``, message: `Хочу лето`, amount: null, created_at: `` },
	{ id: -4, author_name: ``, message: `Сделай мне ням-ням`, amount: null, created_at: `` },
]

function renderBannerImage(text: string, opacity: number): { width: number; height: number; data: Uint8Array } {
	const canvas = document.createElement('canvas')
	canvas.width = CANVAS_W
	canvas.height = CANVAS_H
	const ctx = canvas.getContext('2d')!

	const boardH = 88
	const radius = 12

	// Rounded rect board
	ctx.beginPath()
	ctx.moveTo(radius, 0)
	ctx.lineTo(CANVAS_W - radius, 0)
	ctx.quadraticCurveTo(CANVAS_W, 0, CANVAS_W, radius)
	ctx.lineTo(CANVAS_W, boardH - radius)
	ctx.quadraticCurveTo(CANVAS_W, boardH, CANVAS_W - radius, boardH)
	ctx.lineTo(radius, boardH)
	ctx.quadraticCurveTo(0, boardH, 0, boardH - radius)
	ctx.lineTo(0, radius)
	ctx.quadraticCurveTo(0, 0, radius, 0)
	ctx.closePath()
	ctx.fillStyle = '#ffffff'
	ctx.fill()
	ctx.strokeStyle = '#336CFF'
	ctx.lineWidth = 4
	ctx.stroke()

	// Text with auto-sizing
	ctx.globalAlpha = opacity
	ctx.fillStyle = '#333333'
	ctx.textAlign = 'center'
	ctx.textBaseline = 'middle'
	const maxWidth = CANVAS_W - 24
	let fontSize = 22
	ctx.font = `500 ${fontSize}px sans-serif`
	while (ctx.measureText(text).width > maxWidth && fontSize > 11) {
		fontSize--
		ctx.font = `500 ${fontSize}px sans-serif`
	}
	let displayText = text
	if (ctx.measureText(displayText).width > maxWidth) {
		while (ctx.measureText(`${displayText}...`).width > maxWidth && displayText.length > 0) {
			displayText = displayText.slice(0, -1)
		}
		displayText += '...'
	}
	ctx.fillText(displayText, CANVAS_W / 2, boardH / 2)
	ctx.globalAlpha = 1

	// Pole
	const poleW = 6
	const poleX = (CANVAS_W - poleW) / 2
	ctx.fillStyle = '#336CFF'
	ctx.fillRect(poleX, boardH, poleW, 28)

	// Foot
	const footW = 32
	const footH = 8
	const footX = (CANVAS_W - footW) / 2
	const footY = boardH + 28
	ctx.beginPath()
	ctx.roundRect(footX, footY, footW, footH, 4)
	ctx.fillStyle = '#336CFF'
	ctx.fill()

	const imageData = ctx.getImageData(0, 0, CANVAS_W, CANVAS_H)
	return { width: CANVAS_W, height: CANVAS_H, data: new Uint8Array(imageData.data) }
}

function hasLayer(map: maplibregl.Map, id: string): boolean {
	return Boolean(map.getLayer(id))
}

function hasSource(map: maplibregl.Map, id: string): boolean {
	return Boolean(map.getSource(id))
}

export const MapAdBanner: React.FC<{ map: TMap; mapLoaded: boolean }> = ({ map }) => {
	const { data } = useGetBannerMessagesQuery()
	const [modalOpen, setModalOpen] = useState(false)
	const layerReadyRef = useRef(false)
	const openRef = useRef<() => void>()
	const animRef = useRef<{ index: number; rafId: number; intervalId: ReturnType<typeof setInterval> } | null>(null)

	const messages = data?.messages?.length ? data.messages : DEFAULT_MESSAGES
	const messagesRef = useRef(messages)
	messagesRef.current = messages

	const handleOpen = useCallback(() => {
		setModalOpen(true)
		AndrewLytics(`mapAdBanner.open`)
	}, [])

	openRef.current = handleOpen

	const handleClose = useCallback(() => {
		setModalOpen(false)
	}, [])

	const updateMapImage = useCallback((text: string, opacity: number) => {
		if (!map || !layerReadyRef.current) return
		try {
			map.updateImage(IMAGE_ID, renderBannerImage(text, opacity))
			map.triggerRepaint()
		} catch {
			try {
				map.removeImage(IMAGE_ID)
				map.addImage(IMAGE_ID, renderBannerImage(text, opacity))
			} catch {
				// ignore
			}
		}
	}, [map])

	// Smooth fade animation between messages
	const animateFade = useCallback((fromText: string, toText: string, onDone: () => void) => {
		const start = performance.now()
		const half = FADE_DURATION

		const tick = (now: number): void => {
			const elapsed = now - start
			if (elapsed < half) {
				// Fade out old text
				updateMapImage(fromText, 1 - elapsed / half)
				animRef.current!.rafId = requestAnimationFrame(tick)
			} else if (elapsed < half * 2) {
				// Fade in new text
				updateMapImage(toText, (elapsed - half) / half)
				animRef.current!.rafId = requestAnimationFrame(tick)
			} else {
				updateMapImage(toText, 1)
				onDone()
			}
		}

		animRef.current!.rafId = requestAnimationFrame(tick)
	}, [updateMapImage])

	// Setup source + layer once (follows LiveBusLayer pattern)
	useEffect(() => {
		if (!map || layerReadyRef.current) return

		const activate = (): void => {
			try {
				if (!map.hasImage(IMAGE_ID)) {
					map.addImage(IMAGE_ID, renderBannerImage(DEFAULT_MESSAGES[0].message, 1))
				}
				if (!hasSource(map, SOURCE_ID)) {
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
				if (!hasLayer(map, LAYER_ID)) {
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
				layerReadyRef.current = true
			} catch {
				// Style might not be fully ready
			}
		}

		if (map.isStyleLoaded()) {
			activate()
		} else {
			map.once('load', activate)
		}

		const onClick = (e: maplibregl.MapMouseEvent): void => {
			const features = map.queryRenderedFeatures(e.point, { layers: [LAYER_ID] })
			if (features.length > 0) openRef.current?.()
		}
		const onMouseEnter = (): void => { map.getCanvas().style.cursor = 'pointer' }
		const onMouseLeave = (): void => { map.getCanvas().style.cursor = '' }

		map.on('click', LAYER_ID, onClick)
		map.on('mouseenter', LAYER_ID, onMouseEnter)
		map.on('mouseleave', LAYER_ID, onMouseLeave)

		return () => {
			map.off('click', LAYER_ID, onClick)
			map.off('mouseenter', LAYER_ID, onMouseEnter)
			map.off('mouseleave', LAYER_ID, onMouseLeave)
			try {
				if (hasLayer(map, LAYER_ID)) map.removeLayer(LAYER_ID)
				if (hasSource(map, SOURCE_ID)) map.removeSource(SOURCE_ID)
				if (map.hasImage(IMAGE_ID)) map.removeImage(IMAGE_ID)
			} catch {
				// map destroyed
			}
			layerReadyRef.current = false
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [map])

	// Rotation loop with smooth fade
	useEffect(() => {
		if (!map) return
		const msgs = messagesRef.current
		if (msgs.length <= 1) {
			updateMapImage(msgs[0]?.message ?? '', 1)
			return
		}

		let index = 0
		let animating = false
		animRef.current = { index: 0, rafId: 0, intervalId: setInterval(() => {}) }
		clearInterval(animRef.current.intervalId)

		const rotate = (): void => {
			if (animating) return
			animating = true
			const currentMsgs = messagesRef.current
			const fromText = currentMsgs[index % currentMsgs.length]?.message ?? ''
			index = (index + 1) % currentMsgs.length
			const toText = currentMsgs[index]?.message ?? ''
			animateFade(fromText, toText, () => { animating = false })
		}

		animRef.current.intervalId = setInterval(rotate, ROTATION_INTERVAL)

		return () => {
			if (animRef.current) {
				clearInterval(animRef.current.intervalId)
				cancelAnimationFrame(animRef.current.rafId)
				animRef.current = null
			}
		}
	}, [map, updateMapImage, animateFade])

	return (
		<MapAdBannerModal
			isOpen={modalOpen}
			onClose={handleClose}
			messages={messages.filter(m => m.id > 0)}
		/>
	)
}
