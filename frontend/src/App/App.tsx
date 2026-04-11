import React, { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Home } from 'page/Home'
import { configureI18next, YM } from 'shared/lib'
import { usePing } from 'shared/lib/usePing'
import { useScheduleLoader } from 'shared/store/schedule/useScheduleLoader'

import 'react-spring-bottom-sheet/dist/style.css'
import 'shared/theme/styles/index.css'

const Dev = lazy(() => import('page/Dev/Dev').then(m => ({ default: m.Dev })))

configureI18next()

const ScheduleLoader: React.FC = () => {
	useScheduleLoader()
	usePing()

	return null
}

const LazyAnalytics: React.FC = () => {
	useEffect(() => {
		void import('shared/lib/analytics/helpers').then(({ initGA }) => {
			initGA()
		})
	}, [])

	return null
}

export const Root: React.FC = () => (
	<>
		<ScheduleLoader />
		<LazyAnalytics />
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route
					path="/dev"
					element={
						<Suspense fallback={null}>
							<Dev />
						</Suspense>
					}
				/>
			</Routes>
		</BrowserRouter>
		<YM />
	</>
)
