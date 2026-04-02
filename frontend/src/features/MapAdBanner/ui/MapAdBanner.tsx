import React, { useCallback, useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import { AndrewLytics } from 'shared/lib'
import { BannerMessage, useGetBannerMessagesQuery } from 'shared/api/scheduleApi'

import { TMap } from 'widget/Map/TMap'

import styles from './MapAdBanner.module.css'
import { MapAdBannerModal } from './MapAdBannerModal'

const BANNER_LNG_LAT: [number, number] = [84.909514, 56.462506]
const ROTATION_INTERVAL = 6000
const FADE_DURATION = 500

const DEFAULT_MESSAGES: BannerMessage[] = [
	{ id: -1, author_name: ``, message: `Продам опель астра`, created_at: `` },
	{ id: -2, author_name: ``, message: `Ищу девушку с остановки`, created_at: `` },
	{ id: -3, author_name: ``, message: `Хочу лето`, created_at: `` },
	{ id: -4, author_name: ``, message: `Сделай мне ням-ням`, created_at: `` },
]

export const MapAdBanner: React.FC<{ map: TMap; mapLoaded: boolean }> = ({ map, mapLoaded }) => {
	const { data } = useGetBannerMessagesQuery(undefined, { pollingInterval: 60_000 })
	const [modalOpen, setModalOpen] = useState(false)
	const [currentIndex, setCurrentIndex] = useState(0)
	const [fading, setFading] = useState(false)
	const markerRef = useRef<maplibregl.Marker | null>(null)
	const textRef = useRef<HTMLSpanElement | null>(null)

	const messages = data?.messages?.length ? data.messages : DEFAULT_MESSAGES

	// Rotate messages
	useEffect(() => {
		if (messages.length <= 1) return undefined

		const interval = setInterval(() => {
			setFading(true)

			setTimeout(() => {
				setCurrentIndex(prev => (prev + 1) % messages.length)
				setFading(false)
			}, FADE_DURATION)
		}, ROTATION_INTERVAL)

		return () => clearInterval(interval)
	}, [messages.length])

	// Reset index when messages change
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

	// Create/update marker
	useEffect(() => {
		if (!map || !mapLoaded) return undefined

		const el = document.createElement(`div`)
		el.className = styles.billboard
		el.innerHTML = `
			<div class="${styles.board}">
				<span class="${styles.messageText}" data-banner-text></span>
			</div>
			<div class="${styles.pole}"></div>
			<div class="${styles.foot}"></div>
		`

		el.addEventListener(`click`, (e) => {
			e.stopPropagation()
			handleOpen()
		})

		const textEl = el.querySelector(`[data-banner-text]`) as HTMLSpanElement
		textRef.current = textEl

		const marker = new maplibregl.Marker({ element: el })
			.setLngLat(BANNER_LNG_LAT)
			.addTo(map)

		markerRef.current = marker

		return () => {
			marker.remove()
			markerRef.current = null
			textRef.current = null
		}
	}, [map, mapLoaded, handleOpen])

	// Update text content reactively
	useEffect(() => {
		if (!textRef.current) return

		const current = messages[currentIndex % messages.length]
		textRef.current.textContent = current?.message ?? ``
		textRef.current.className = fading
			? `${styles.messageText} ${styles.fading}`
			: styles.messageText
	}, [currentIndex, fading, messages])

	return (
		<MapAdBannerModal
			isOpen={modalOpen}
			onClose={handleClose}
			messages={messages.filter(m => m.id > 0)}
		/>
	)
}
