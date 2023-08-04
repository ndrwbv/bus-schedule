import React, { FC } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { BetaRedirect } from 'page/BetaRedirect/BetaRedirect'
import { Home } from 'page/Home/Home'

export const Game = React.lazy(() => import(`page/Game/Game`))
export const Intro = React.lazy(() => import(`page/Game/Intro/Intro`))

export const Router: FC = () => {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/beta" element={<BetaRedirect />} />
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
	)
}
