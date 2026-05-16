/* eslint-disable no-console */
import ym from 'react-yandex-metrika'

export const AndrewLytics = (goal: string): void => {
	const isProd = process.env.NODE_ENV === `production`

	if (isProd) ym(`reachGoal`, goal)
	else console.info(`AndrewLytics >`, goal)
}
