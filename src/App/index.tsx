import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Game from 'page/Game/Game'
import Intro from 'page/Game/Intro/Intro'
import { configureI18next, initGA, YM } from 'shared/lib'

import 'react-spring-bottom-sheet/dist/style.css'
import 'shared/theme/styles/index.css'
import { Home } from '../page/Home/Home'

initGA()

configureI18next()

export const Root: React.FC = () => (
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
