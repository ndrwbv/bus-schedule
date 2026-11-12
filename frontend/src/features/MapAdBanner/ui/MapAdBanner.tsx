import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useGetBannerMessagesQuery } from 'shared/api/scheduleApi'
import { AndrewLytics } from 'shared/lib'
import { MAIN_BLUE } from 'shared/theme'
import { TMap } from 'widget/Map/TMap'

import { MapAdBannerModal } from './MapAdBannerModal'

const BANNER_COORDS: [number, number] = [84.909514, 56.462506]
const ROTATION_INTERVAL = 6000
const FADE_DURATION = 500
const RECENT_DONATIONS_LIMIT = 5
const SOURCE_ID = `ad-banner-source`
const LAYER_ID = `ad-banner-layer`
const IMAGE_ID = `ad-banner-img`
const CANVAS_W = 240
const CANVAS_H = 132

const DEFAULT_MESSAGES = [`Продам опель астра`, `Ищу девушку с остановки`, `Хочу лето`, `Сделай мне ням-ням`]

function renderBannerImage(text: string, opacity: number): { width: number; height: number; data: Uint8Array } {
	const canvas = document.createElement(`canvas`)
	canvas.width = CANVAS_W
	canvas.height = CANVAS_H
	const ctx = canvas.getContext(`2d`)!

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
	ctx.fillStyle = `#ffffff`
	ctx.fill()
	ctx.strokeStyle = MAIN_BLUE
	ctx.lineWidth = 4
	ctx.stroke()

	// Text with auto-sizing
	ctx.globalAlpha = opacity
	ctx.fillStyle = `#333333`
	ctx.textAlign = `center`
	ctx.textBaseline = `middle`
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
		displayText += `...`
	}
	ctx.fillText(displayText, CANVAS_W / 2, boardH / 2)
	ctx.globalAlpha = 1

	// Pole
	const poleW = 6
	const poleX = (CANVAS_W - poleW) / 2
	ctx.fillStyle = MAIN_BLUE
	ctx.fillRect(poleX, boardH, poleW, 28)

	// Foot
	const footW = 32
	const footH = 8
	const footX = (CANVAS_W - footW) / 2
	const footY = boardH + 28
	ctx.beginPath()
	ctx.roundRect(footX, footY, footW, footH, 4)
	ctx.fillStyle = MAIN_BLUE
	ctx.fill()

	const imageData = ctx.getImageData(0, 0, CANVAS_W, CANVAS_H)

	return { width: CANVAS_W, height: CANVAS_H, data: new Uint8Array(imageData.data) }
}

export const MapAdBanner: React.FC<{ map: TMap; mapLoaded: boolean }> = ({ map, mapLoaded }) => {
	const { data } = useGetBannerMessagesQuery()
	const [modalOpen, setModalOpen] = useState(false)
	const messages = useMemo(
		() =>
			data?.messages.map(entry => ({
				...entry,
				message: entry.message?.trim() ? entry.message : `Спасибо, ${entry.author_name} ❤️`,
			})) ?? [],
		[data],
	)

	const handleOpen = useCallback(() => {
		setModalOpen(true)
		AndrewLytics(`mapAdBanner.open`)
	}, [])

	const handleClose = useCallback(() => {
		setModalOpen(false)
	}, [])

	useEffect(() => {
		if (!map || !mapLoaded) return undefined

		map.addImage(IMAGE_ID, renderBannerImage(DEFAULT_MESSAGES[0], 1))
		map.addSource(SOURCE_ID, {
			type: `geojson`,
			data: {
				type: `Feature`,
				geometry: { type: `Point`, coordinates: BANNER_COORDS },
				properties: {},
			},
		})
		map.addLayer({
			id: LAYER_ID,
			type: `symbol`,
			source: SOURCE_ID,
			layout: {
				'icon-image': IMAGE_ID,
				'icon-size': 0.5,
				'icon-anchor': `bottom`,
				'icon-allow-overlap': true,
				'icon-ignore-placement': true,
			},
		})

		const onMouseEnter = (): void => {
			map.getCanvas().style.cursor = `pointer`
		}
		const onMouseLeave = (): void => {
			map.getCanvas().style.cursor = ``
		}

		map.on(`click`, LAYER_ID, handleOpen)
		map.on(`mouseenter`, LAYER_ID, onMouseEnter)
		map.on(`mouseleave`, LAYER_ID, onMouseLeave)

		return () => {
			map.off(`click`, LAYER_ID, handleOpen)
			map.off(`mouseenter`, LAYER_ID, onMouseEnter)
			map.off(`mouseleave`, LAYER_ID, onMouseLeave)
			if (map.getLayer(LAYER_ID)) {
				map.removeLayer(LAYER_ID)
				map.removeSource(SOURCE_ID)
				map.removeImage(IMAGE_ID)
			}
		}
	}, [map, mapLoaded, handleOpen])

	useEffect(() => {
		if (!map || !mapLoaded) return undefined

		const texts = messages.length
			? messages.slice(0, RECENT_DONATIONS_LIMIT).map(entry => entry.message)
			: DEFAULT_MESSAGES
		const draw = (text: string, opacity: number): void => {
			if (!map.getLayer(LAYER_ID)) return

			map.updateImage(IMAGE_ID, renderBannerImage(text, opacity))
			map.triggerRepaint()
		}

		draw(texts[0], 1)
		if (texts.length === 1) return undefined

		let currentIndex = 0
		let frameId = 0

		const rotate = (): void => {
			if (frameId) return

			const fromText = texts[currentIndex]
			currentIndex = (currentIndex + 1) % texts.length
			const toText = texts[currentIndex]
			const start = performance.now()

			const tick = (now: number): void => {
				const progress = (now - start) / FADE_DURATION
				if (progress >= 2) {
					draw(toText, 1)
					frameId = 0

					return
				}

				if (progress < 1) {
					draw(fromText, Math.min(1, 1 - progress))
				} else {
					draw(toText, progress - 1)
				}
				frameId = requestAnimationFrame(tick)
			}
			frameId = requestAnimationFrame(tick)
		}

		const intervalId = setInterval(rotate, ROTATION_INTERVAL)

		return () => {
			clearInterval(intervalId)
			cancelAnimationFrame(frameId)
		}
	}, [map, mapLoaded, messages])

	return <MapAdBannerModal isOpen={modalOpen} onClose={handleClose} messages={messages} />
}
