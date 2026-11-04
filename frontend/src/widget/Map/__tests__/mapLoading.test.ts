import type { Map as LibreMap } from 'maplibre-gl'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { MAP_LOAD_TIMEOUT_MS, watchMapLoading } from '../mapLoading'

// Inferred fixture type retains Vitest mock helpers.
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const setup = (fallback = true) => {
	vi.useFakeTimers()
	const handlers = new Map<string, (event: { error?: Error }) => void>()
	const map = {
		on: vi.fn((name: string, callback: (event: { error?: Error }) => void) => handlers.set(name, callback)),
		off: vi.fn((name: string) => handlers.delete(name)),
		areTilesLoaded: vi.fn(() => false),
	}
	const callbacks = { onStyleReady: vi.fn(), onLoaded: vi.fn(), onFallback: vi.fn(), onError: vi.fn() }
	const dispose = watchMapLoading(map as unknown as LibreMap, fallback, callbacks)

	return { map, handlers, callbacks, dispose }
}

afterEach(() => vi.useRealTimers())

describe(`Map loading`, () => {
	it(`switches provider on a missing style`, () => {
		const { handlers, callbacks } = setup()
		handlers.get(`error`)?.({ error: new Error(`404`) })
		expect(callbacks.onFallback).toHaveBeenCalledOnce()
		expect(callbacks.onError).not.toHaveBeenCalled()
	})
	it(`keeps stops available on style load and ignores individual tile errors`, () => {
		const { handlers, callbacks } = setup()
		handlers.get(`style.load`)?.({})
		handlers.get(`error`)?.({ error: new Error(`tile failed`) })
		expect(callbacks.onStyleReady).toHaveBeenCalledOnce()
		expect(callbacks.onError).not.toHaveBeenCalled()
		vi.advanceTimersByTime(MAP_LOAD_TIMEOUT_MS)
		expect(callbacks.onFallback).toHaveBeenCalledOnce()
	})
	it(`does not time out rendered tiles when the load event is delayed`, () => {
		const { handlers, callbacks, map } = setup()
		handlers.get(`style.load`)?.({})
		map.areTilesLoaded.mockReturnValue(true)
		vi.advanceTimersByTime(MAP_LOAD_TIMEOUT_MS)
		expect(callbacks.onFallback).not.toHaveBeenCalled()
	})
	it(`shows an error if both providers fail and cancels work on retry`, () => {
		const { callbacks, dispose, handlers } = setup(false)
		vi.advanceTimersByTime(MAP_LOAD_TIMEOUT_MS)
		expect(callbacks.onError).toHaveBeenCalledOnce()
		expect(callbacks.onFallback).not.toHaveBeenCalled()
		dispose()
		expect(handlers.size).toBe(0)
		vi.advanceTimersByTime(MAP_LOAD_TIMEOUT_MS)
		expect(callbacks.onError).toHaveBeenCalledOnce()
	})
	it(`cancels the pending timeout when the component unmounts`, () => {
		const { dispose, callbacks } = setup()
		dispose()
		vi.advanceTimersByTime(MAP_LOAD_TIMEOUT_MS)
		expect(callbacks.onFallback).not.toHaveBeenCalled()
	})
})
