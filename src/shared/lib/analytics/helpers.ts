/* eslint-disable no-console */
import ReactGA from 'react-ga'
import ym from 'react-yandex-metrika'
import { config } from 'shared/configs'

export const AndrewLytics = (goal: string): void => {
	const isProd = process.env.NODE_ENV === `production`

	if (isProd) ym(`reachGoal`, goal)
	else console.log(`AndrewLytics >`, goal)
}

export const initGA = (): void => {
	if (process.env.NODE_ENV === `production`) {
		ReactGA.initialize(config.GOOGLE_UID)
		ReactGA.pageview(window.location.pathname + window.location.search)
	}
}
