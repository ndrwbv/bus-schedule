import { createSlice, PayloadAction } from '@reduxjs/toolkit'

const STORAGE_KEY = `severbus:settings`

interface SettingsState {
	showLiveBus: boolean
}

function loadFromStorage(): SettingsState {
	try {
		const raw = localStorage.getItem(STORAGE_KEY)
		if (raw) {
			const parsed = JSON.parse(raw) as Partial<SettingsState>

			return {
				showLiveBus: parsed.showLiveBus ?? true,
			}
		}
	} catch {
		// ignore
	}

	return { showLiveBus: true }
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
