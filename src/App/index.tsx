import { BrowserRouter, Route, Routes } from 'react-router-dom'

import App from './App'

import { initGA } from 'shared/lib'
import { configureI18next, YM } from 'shared/lib'

import Game from 'Game/Game'
import Intro from 'Game/Intro/Intro'

import 'shared/theme/styles/index.css'

initGA()

configureI18next()

export const Root = () => (
	<>
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<App />} />
				<Route path="/game" element={<Intro />} />
				<Route path="/game/doubles" element={<Game />} />
			</Routes>
		</BrowserRouter>
		<YM />
	</>
)
