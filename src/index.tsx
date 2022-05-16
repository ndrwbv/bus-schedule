import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App/App'

import { initGA } from 'helpers/analytics'
import YM from 'YM'

import './index.css'
import { configureI18next } from 'i18n/config.i18next'

initGA()

configureI18next()

const container = document.getElementById('root')
const root = createRoot(container!)

root.render(
	<React.StrictMode>
		<App />
		<YM />
	</React.StrictMode>,
)
