import type { Map as LibreMap } from 'maplibre-gl'

export const MAP_LOAD_TIMEOUT_MS = 15_000

interface LoadingCallbacks {
	onStyleReady: () => void
	onLoaded: () => void
	onFallback: () => void
	onError: (message: string) => void
}

/** Keep a usable style interactive while missing tiles are retried through the backup provider. */
export const watchMapLoading = (map: LibreMap, canFallback: boolean, callbacks: LoadingCallbacks): (() => void) => {
	let loaded = false
	let hasStyle = false
	let disposed = false
	const onStyle = (): void => {
		hasStyle = true
		callbacks.onStyleReady()
	}
	const onLoad = (): void => {
		loaded = true
		callbacks.onLoaded()
	}
	const onError = (event: { error?: { message: string } }): void => {
		if (loaded || hasStyle || disposed) return
		if (canFallback) callbacks.onFallback()
		else callbacks.onError(event.error?.message ?? `Не удалось загрузить карту`)
	}
	map.on(`style.load`, onStyle)
	map.on(`load`, onLoad)
	map.on(`error`, onError)
	const timer = setTimeout(() => {
		if (disposed || loaded || (hasStyle && map.areTilesLoaded())) return
		if (canFallback) callbacks.onFallback()
		else callbacks.onError(`Не удалось загрузить подложку карты. Проверьте подключение и попробуйте ещё раз.`)
	}, MAP_LOAD_TIMEOUT_MS)

	return () => {
		disposed = true
		clearTimeout(timer)
		map.off(`style.load`, onStyle)
		map.off(`load`, onLoad)
		map.off(`error`, onError)
	}
}
