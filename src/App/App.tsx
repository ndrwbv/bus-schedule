import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { HomeBeta } from 'page/HomeBeta'
import { configureI18next, initGA, YM } from 'shared/lib'

import 'react-spring-bottom-sheet/dist/style.css'
import 'shared/theme/styles/index.css'
import { Home } from '../page/Home/Home'

const Game = React.lazy(() => import(`page/Game/Game`))
const Intro = React.lazy(() => import(`page/Game/Intro/Intro`))

initGA()

configureI18next()

export const Root: React.FC = () => (
	<>
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/beta" element={<HomeBeta />} />
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
