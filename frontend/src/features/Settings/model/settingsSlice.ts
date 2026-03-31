import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { MapProvider } from 'widget/Map/mapProvider'

const STORAGE_KEY = `severbus:settings`

interface SettingsState {
	showLiveBus: boolean
	mapProvider: MapProvider
}

function loadFromStorage(): SettingsState {
	try {
		const raw = localStorage.getItem(STORAGE_KEY)
		if (raw) {
			const parsed = JSON.parse(raw) as Partial<SettingsState>

			return {
				showLiveBus: parsed.showLiveBus ?? false,
				mapProvider: parsed.mapProvider ?? `openfreemap`,
			}
		}
	} catch {
		// ignore
	}

	return { showLiveBus: false, mapProvider: `openfreemap` }
}

function saveToStorage(state: SettingsState): void {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
	} catch {
		// ignore
	}
}

const initialState: SettingsState = loadFromStorage()

export const settingsSlice = createSlice({
	name: `settings`,
	initialState,
	reducers: {
		setShowLiveBus: (state, action: PayloadAction<boolean>) => {
			state.showLiveBus = action.payload
			saveToStorage(state)
		},
		setMapProvider: (state, action: PayloadAction<MapProvider>) => {
			state.mapProvider = action.payload
			saveToStorage(state)
		},
	},
})

export const { setShowLiveBus, setMapProvider } = settingsSlice.actions

export const showLiveBusSelector = (state: { settings: SettingsState }): boolean =>
	state.settings.showLiveBus

export const mapProviderSelector = (state: { settings: SettingsState }): MapProvider =>
	state.settings.mapProvider

export default settingsSlice.reducer
