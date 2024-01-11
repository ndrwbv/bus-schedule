import { FC, useState } from 'react'

import { EndGame } from './EndGame/EndGame'
import { Onboarding } from './Onboarding/Onboarding'
import { Pickup } from './Pickup/Pickup'
import { Riding } from './Riding/Riding'

type TGameStates = 'onboarding' | 'riding' | 'pickup' | 'endgame'

interface IGameState {
	state: TGameStates
}

export const BusDriverGame: FC = () => {
	const [gameState, setGameState] = useState<IGameState>({
		state: `onboarding`,
	})

	const handleNextState = (): void => {
		const isEndGame = false
		if (isEndGame) {
			setGameState({ state: `endgame` })

			return
		}

		setGameState(prev => ({
			state: prev.state === `riding` ? `pickup` : `riding`,
		}))
	}

	const handleNewGame = (): void => {
		setGameState({ state: `riding` })
	}

	switch (gameState.state) {
		case `onboarding`:
			return <Onboarding startNewGame={handleNewGame} />
		case `endgame`:
			return <EndGame startNewGame={handleNewGame} />
		case `pickup`:
			return <Pickup nextState={handleNextState} />
		case `riding`:
			return <Riding nextState={handleNextState} />

		default:
			return <Onboarding />
	}
}
