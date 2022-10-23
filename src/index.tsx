import React from 'react'
import { createRoot } from 'react-dom/client'
import { store } from './App/model/configureStore'
import { Provider } from 'react-redux'
import { Root } from 'App'

const container = document.getElementById('root')
const root = createRoot(container!)

root.render(
	<React.StrictMode>
		<Provider store={store}>
			<Root />
		</Provider>
	</React.StrictMode>,
)
