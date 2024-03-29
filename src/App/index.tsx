import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from 'shared/store/app/configureStore'

import { Root } from './App'

const container = document.getElementById(`root`)
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container!)

root.render(
	<Provider store={store}>
		<Root />
	</Provider>,
)
