import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Home } from 'page/Home'
import { configureI18next, YM } from 'shared/lib'
import { usePing } from 'shared/lib/usePing'
import { useScheduleLoader } from 'shared/store/schedule/useScheduleLoader'

import 'react-spring-bottom-sheet/dist/style.css'
import 'shared/theme/styles/index.css'

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
			</Routes>
		</BrowserRouter>
		<YM />
	</>
)
