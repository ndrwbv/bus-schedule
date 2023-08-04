import React from 'react'
import { configureI18next, initGA, YM } from 'shared/lib'

import 'react-spring-bottom-sheet/dist/style.css'
import 'shared/theme/styles/index.css'
import { Router } from './Router'

initGA()

configureI18next()

export const App: React.FC = () => (
	<>
		<Router />
		<YM />
	</>
)
