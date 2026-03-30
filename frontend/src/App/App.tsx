import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Dev } from 'page/Dev/Dev'
import { Home } from 'page/Home'
import { configureI18next, initGA, YM } from 'shared/lib'
import { usePing } from 'shared/lib/usePing'
import { useScheduleLoader } from 'shared/store/schedule/useScheduleLoader'

import 'react-spring-bottom-sheet/dist/style.css'
import 'shared/theme/styles/index.css'

const Game = React.lazy(() => import(`page/Game/Game`))
const Intro = React.lazy(() => import(`page/Game/Intro/Intro`))

initGA()

configureI18next()

const ScheduleLoader: React.FC = () => {
	useScheduleLoader()
	usePing()

	return null
}

export const Root: React.FC = () => (
	<>
		<ScheduleLoader />
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/dev" element={<Dev />} />
				<Route
					path="/game"
					element={
						<React.Suspense fallback={<>...</>}>
							<Intro />
						</React.Suspense>
					}
				/>
				<Route
					path="/game/doubles"
					element={
						<React.Suspense fallback={<>...</>}>
							<Game />
						</React.Suspense>
					}
				/>
			</Routes>
		</BrowserRouter>
		<YM />
	</>
)
