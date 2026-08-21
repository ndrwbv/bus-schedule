import { createSlice, PayloadAction } from '@reduxjs/toolkit'

const STORAGE_KEY = `severbus:settings`

/** Живой автобус включён всем по умолчанию; кто выключил его сам — остаётся с выключенным. */
const DEFAULT_SHOW_LIVE_BUS = true

interface SettingsState {
	showLiveBus: boolean
}

function loadFromStorage(): SettingsState {
	try {
		const raw = localStorage.getItem(STORAGE_KEY)
		if (raw) {
			const parsed = JSON.parse(raw) as Partial<SettingsState>

			return {
				showLiveBus: parsed.showLiveBus ?? DEFAULT_SHOW_LIVE_BUS,
			}
		}
	} catch {
		// ignore
	}

	return { showLiveBus: DEFAULT_SHOW_LIVE_BUS }
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
	},
})

export const { setShowLiveBus } = settingsSlice.actions

export const showLiveBusSelector = (state: { settings: { showLiveBus: boolean } }): boolean =>
	state.settings.showLiveBus

export default settingsSlice.reducer
