import { MAIN_BLUE } from 'shared/theme'

import { PinColors } from './icon'

export const CLUSTER_RADIUS = 20
export const CLUSTER_PIXEL_RATIO = 2

export const getClusterImage = (): ImageData | null => {
	const radius = CLUSTER_RADIUS * CLUSTER_PIXEL_RATIO
	const size = radius * 2
	const canvas = document.createElement(`canvas`)
	canvas.width = size
	canvas.height = size
	const ctx = canvas.getContext(`2d`)
	if (!ctx) return null

	const gradient = ctx.createLinearGradient(size * 0.17, 0, radius, size)
	gradient.addColorStop(0.23, PinColors.BLUE.mainGradientStart)
	gradient.addColorStop(1, MAIN_BLUE)
	ctx.fillStyle = gradient
	ctx.beginPath()
	ctx.arc(radius, radius, radius, 0, Math.PI * 2)
	ctx.fill()

	return ctx.getImageData(0, 0, size, size)
}
