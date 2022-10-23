import React from 'react'
import { createRoot } from 'react-dom/client'

import { Root } from 'App'

const container = document.getElementById('root')
const root = createRoot(container!)

root.render(
	<React.StrictMode>
		<Root />
	</React.StrictMode>,
)
