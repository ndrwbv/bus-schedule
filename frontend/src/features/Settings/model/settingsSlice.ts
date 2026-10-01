import { createSlice, PayloadAction } from '@reduxjs/toolkit'

const STORAGE_KEY = `severbus:settings`

/** Живой автобус включён всем по умолчанию; кто выключил его сам — остаётся с выключенным. */
const DEFAULT_SHOW_LIVE_BUS = true
/** Направление автобуса (specs/14-live-bus-direction.md) — бета, включает только тот, кто захотел */
const DEFAULT_SHOW_BUS_DIRECTION = false

interface SettingsState {
	showLiveBus: boolean
	showBusDirection: boolean
}

function loadFromStorage(): SettingsState {
	try {
		const raw = localStorage.getItem(STORAGE_KEY)
		if (raw) {
			const parsed = JSON.parse(raw) as Partial<SettingsState>

			return {
				showLiveBus: parsed.showLiveBus ?? DEFAULT_SHOW_LIVE_BUS,
				showBusDirection: parsed.showBusDirection ?? DEFAULT_SHOW_BUS_DIRECTION,
			}
		}
	} catch {
		// ignore
	}

	return { showLiveBus: DEFAULT_SHOW_LIVE_BUS, showBusDirection: DEFAULT_SHOW_BUS_DIRECTION }
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
		setShowBusDirection: (state, action: PayloadAction<boolean>) => {
			state.showBusDirection = action.payload
			saveToStorage(state)
		},
	},
})

export const { setShowLiveBus, setShowBusDirection } = settingsSlice.actions

export const showLiveBusSelector = (state: { settings: { showLiveBus: boolean } }): boolean =>
	state.settings.showLiveBus

export const showBusDirectionSelector = (state: { settings: { showBusDirection: boolean } }): boolean =>
	state.settings.showBusDirection

export default settingsSlice.reducer
