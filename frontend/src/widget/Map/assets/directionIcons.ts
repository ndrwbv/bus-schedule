/**
 * Картинки для направления live-автобуса (specs/14-live-bus-direction.md).
 * Подписи — картинками, а не text-field: глифы self-hosted тайлов не нужны, и текст
 * рисуется системным шрифтом как в остальном интерфейсе.
 */

export const ARROW_ICON_ID = `livebus-arrow`
export const DIRECTION_LABEL_ICON_ID = {
	out: `livebus-dir-out`,
	inLB: `livebus-dir-inlb`,
} as const

const PIXEL_RATIO = 2

/**
 * 64×64, центр совпадает с центром иконки автобуса (40×40, радиус кружка 20).
 * Треугольник у верхнего края: при повороте вокруг центра он обходит кружок снаружи
 * и не закрывает сам автобус.
 */
const ARROW_SVG = `<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <path d="M32 1 L44 16 Q32 12 20 16 Z" fill="#FF6B35" stroke="#fff" stroke-width="2" stroke-linejoin="round"/>
</svg>`

function labelSvg(text: string): string {
	const width = 18 + text.length * 7

	return `<svg width="${width}" height="20" viewBox="0 0 ${width} 20" xmlns="http://www.w3.org/2000/svg">
  <rect x="0.5" y="0.5" width="${width - 1}" height="19" rx="9.5" fill="#fff" stroke="#FF6B35"/>
  <text x="${width / 2}" y="14" text-anchor="middle" font-size="12" font-weight="600"
    font-family="-apple-system, BlinkMacSystemFont, Roboto, Arial, sans-serif" fill="#333">${text}</text>
</svg>`
}

const ICONS: [string, string][] = [
	[ARROW_ICON_ID, ARROW_SVG],
	[DIRECTION_LABEL_ICON_ID.out, labelSvg(`в город`)],
	[DIRECTION_LABEL_ICON_ID.inLB, labelSvg(`из города`)],
]

interface ImageMap {
	hasImage: (id: string) => boolean
	addImage: (id: string, img: HTMLImageElement, options?: { pixelRatio?: number }) => void
}

function loadSvg(map: ImageMap, id: string, svg: string): Promise<void> {
	return new Promise((resolve, reject) => {
		if (map.hasImage(id)) {
			resolve()

			return
		}

		const width = Number(/width="(\d+)"/.exec(svg)?.[1] ?? 64)
		const height = Number(/height="(\d+)"/.exec(svg)?.[1] ?? 64)
		const img = new Image(width * PIXEL_RATIO, height * PIXEL_RATIO)
		img.onload = () => {
			if (!map.hasImage(id)) map.addImage(id, img, { pixelRatio: PIXEL_RATIO })
			resolve()
		}
		img.onerror = reject
		img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
	})
}

export function loadDirectionImages(map: ImageMap): Promise<void> {
	return Promise.all(ICONS.map(([id, svg]) => loadSvg(map, id, svg))).then(() => undefined)
}
