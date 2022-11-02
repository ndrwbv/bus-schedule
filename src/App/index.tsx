import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { Home } from '../page/Home/Home'

import { initGA } from 'shared/lib'
import { configureI18next, YM } from 'shared/lib'

import Game from 'page/Game/Game'
import Intro from 'page/Game/Intro/Intro'

import 'react-spring-bottom-sheet/dist/style.css'
import 'shared/theme/styles/index.css'

initGA()

configureI18next()

export const Root = () => (
	<>
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/game" element={<Intro />} />
				<Route path="/game/doubles" element={<Game />} />
			</Routes>
		</BrowserRouter>
		<YM />
	</>
)
