import React from 'react'
import ReactDOM from 'react-dom'
import App from './App/App'

import { initGA } from 'helpers/analytics'
import YM from 'YM'

import './index.css'

initGA()

ReactDOM.render(
	<React.StrictMode>
		<App />
		<YM />
	</React.StrictMode>,
	document.getElementById('root'),
)
