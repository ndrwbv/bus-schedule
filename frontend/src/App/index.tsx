import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { ComplainsProvider } from 'features/Complains'
import { store } from 'shared/store/app/configureStore'
import { registerSW } from 'virtual:pwa-register'

import { Root } from './App'

registerSW({ immediate: true })

const container = document.getElementById(`root`)
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container!)

root.render(
	<Provider store={store}>
		<ComplainsProvider>
			<Root />
		</ComplainsProvider>
	</Provider>,
)
