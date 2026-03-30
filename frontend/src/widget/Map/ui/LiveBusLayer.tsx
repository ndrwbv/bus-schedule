import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import * as maptilersdk from '@maptiler/sdk'
import { showLiveBusSelector } from 'features/Settings/model/settingsSlice'
import { LiveBusPosition, useGetFeaturesQuery, useGetLiveQuery } from 'shared/api/scheduleApi'
import { setLiveTracking } from 'shared/store/app/featureToggleSlice'
import { liveTrackingEnabledSelector } from 'shared/store/app/selectors/liveTracking'

import { BUS_ICON_SIZE, busIconSvg } from '../assets/busIcon'
import { TMap } from '../TMap'

interface MarkerState {
	marker: maptilersdk.Marker
	lat: number
	lng: number
	targetLat: number
	targetLng: number
	animationId: number | null
}

const LERP_DURATION = 1500 // ms for smooth movement

function createBusElement(): HTMLDivElement {
	const el = document.createElement(`div`)
	el.className = `live-bus-marker`
	el.innerHTML = `
		<div class="live-bus-pulse"></div>
		<div class="live-bus-icon">${busIconSvg}</div>
	`
	el.style.cssText = `
		position: relative;
		width: ${BUS_ICON_SIZE}px;
		height: ${BUS_ICON_SIZE}px;
		opacity: 0;
		transition: opacity 0.8s ease;
	`

	// Fade in
	requestAnimationFrame(() => {
		el.style.opacity = `1`
	})

	return el
}

function animateMarker(state: MarkerState): void {
	if (state.animationId) {
		cancelAnimationFrame(state.animationId)
	}

	const startLat = state.lat
	const startLng = state.lng
	const startTime = performance.now()

	const step = (now: number): void => {
		const elapsed = now - startTime
		const t = Math.min(elapsed / LERP_DURATION, 1)
		// Ease-out cubic
		const ease = 1 - (1 - t) ** 3

		state.lat = startLat + (state.targetLat - startLat) * ease
		state.lng = startLng + (state.targetLng - startLng) * ease
		state.marker.setLngLat([state.lng, state.lat])

		if (t < 1) {
			state.animationId = requestAnimationFrame(step)
		} else {
			state.animationId = null
		}
	}

	state.animationId = requestAnimationFrame(step)
}

export const LiveBusLayer: React.FC<{ map: TMap }> = ({ map }) => {
	const dispatch = useDispatch()
	const liveTrackingEnabled = useSelector(liveTrackingEnabledSelector)
	const showLiveBus = useSelector(showLiveBusSelector)

	const shouldPoll = liveTrackingEnabled && showLiveBus
	const markersRef = useRef<MarkerState[]>([])

	// Poll features every 60s
	const { data: features } = useGetFeaturesQuery(undefined, {
		pollingInterval: 60_000,
	})

	// Sync feature flag to Redux
	useEffect(() => {
		if (features) {
			dispatch(setLiveTracking(Boolean(features.liveTracking)))
		}
	}, [features, dispatch])

	// Poll live data every 15s when enabled
	const { data: liveData } = useGetLiveQuery(undefined, {
		pollingInterval: 15_000,
		skip: !shouldPoll,
	})

	useEffect(() => {
		if (!map) return

		const buses: LiveBusPosition[] = liveData?.buses ?? []
		const existingMarkers = markersRef.current
		const newMarkerStates: MarkerState[] = []

		// Match new buses to existing markers by index (no IDs from API)
		for (let i = 0; i < buses.length; i++) {
			const bus = buses[i]

			if (i < existingMarkers.length) {
				// Update existing marker position with animation
				const state = existingMarkers[i]
				state.targetLat = bus.lat
				state.targetLng = bus.lng
				animateMarker(state)
				newMarkerStates.push(state)
			} else {
				// Create new marker
				const el = createBusElement()
				const marker = new maptilersdk.Marker({ element: el, anchor: `center` })
					.setLngLat([bus.lng, bus.lat])
					.addTo(map)

				newMarkerStates.push({
					marker,
					lat: bus.lat,
					lng: bus.lng,
					targetLat: bus.lat,
					targetLng: bus.lng,
					animationId: null,
				})
			}
		}

		// Remove extra markers with fade-out
		for (let i = buses.length; i < existingMarkers.length; i++) {
			const state = existingMarkers[i]
			if (state.animationId) cancelAnimationFrame(state.animationId)

			const el = state.marker.getElement()
			el.style.opacity = `0`
			setTimeout(() => {
				state.marker.remove()
			}, 800)
		}

		markersRef.current = newMarkerStates

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [liveData, map])

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			// eslint-disable-next-line react-hooks/exhaustive-deps
			for (const state of markersRef.current) {
				if (state.animationId) cancelAnimationFrame(state.animationId)
				state.marker.remove()
			}
			markersRef.current = []
		}
	}, [])

	// Remove markers when disabled
	useEffect(() => {
		if (!shouldPoll) {
			for (const state of markersRef.current) {
				if (state.animationId) cancelAnimationFrame(state.animationId)
				const el = state.marker.getElement()
				el.style.opacity = `0`
				setTimeout(() => {
					state.marker.remove()
				}, 800)
			}
			markersRef.current = []
		}
	}, [shouldPoll])

	return null
}
