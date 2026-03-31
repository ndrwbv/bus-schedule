import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Dev } from 'page/Dev/Dev'
import { Home } from 'page/Home'
import { configureI18next, initGA, YM } from 'shared/lib'
import { usePing } from 'shared/lib/usePing'
import { useScheduleLoader } from 'shared/store/schedule/useScheduleLoader'

import 'shared/theme/styles/index.css'

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
			</Routes>
		</BrowserRouter>
		<YM />
	</>
)
