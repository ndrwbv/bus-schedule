import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import App from './App/App'

import { initGA } from 'helpers/analytics'
import YM from 'YM'

import './index.css'
import { configureI18next } from 'i18n/config.i18next'
import Game from 'Game/Game'
import Intro from 'Game/Intro/Intro'

initGA()

configureI18next()

const container = document.getElementById('root')
const root = createRoot(container!)

root.render(
	<React.StrictMode>
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<App />} />
				<Route path="/game" element={<Intro />} />
				<Route path="/game/doubles" element={<Game />} />
			</Routes>
		</BrowserRouter>
		<YM />
	</React.StrictMode>,
)
