import React from 'react'
import ReactDOM from 'react-dom'
import App from './App/App'

import { initGA } from 'helpers/analytics'
import YM from 'YM'

import './index.css'
import { configureI18next } from 'i18n/config.i18next'

initGA()

configureI18next();

ReactDOM.render(
	<React.StrictMode>
		<App />
		<YM />
	</React.StrictMode>,
	document.getElementById('root'),
)
