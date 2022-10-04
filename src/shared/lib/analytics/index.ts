import ym from 'react-yandex-metrika'
import ReactGA from 'react-ga'
import config from 'shared/configs'

export const AndrewLytics = (goal: string) => {
	const isProd = process.env.NODE_ENV === 'production'
	isProd ? ym('reachGoal', goal) : console.log('AndrewLytics >', goal)
}

export const initGA = () => {
	if (process.env.NODE_ENV === 'production') {
		ReactGA.initialize(config.GOOGLE_UID)
		ReactGA.pageview(window.location.pathname + window.location.search)
	}
}
