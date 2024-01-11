import { FC, useCallback, useEffect, useState } from 'react'

import { FARE } from './const/FARE'
import { MAX_COMPLAINS } from './const/MAX_COMPLAINS'
import { EndGame } from './EndGame/EndGame'
import { IPassenger } from './entities/Passenger/IPassenger'
import { calculateComplains } from './features/GameComplain/calculateComplains'
import { IGameComplain } from './features/GameComplain/IGameComplain'
import { Onboarding } from './Onboarding/Onboarding'
import { Pickup } from './Pickup/Pickup'
import { Riding } from './Riding/Riding'

type TGameStates = 'onboarding' | 'riding' | 'pickup' | 'endgame'

interface IGameState {
	state: TGameStates
}

interface IGameData {
	complains: IGameComplain[]
	balance: number
	transportedPassengers: number
	currentPassengers: IPassenger[]
	rejectedPassegers: IPassenger[]
}

const filterDisembarkPassengers = (data: IPassenger[]): IPassenger[] => data

export const BusDriverGame: FC = () => {
	const [gameState, setGameState] = useState<IGameState>({
		state: `onboarding`,
	})

	const [gameData, setGameData] = useState<IGameData>({
		complains: [],
		balance: 0,
		transportedPassengers: 0,
		currentPassengers: [],
		rejectedPassegers: [],
	})

	const updatePassengersData = (accepted: IPassenger[], rejected: IPassenger[]): void => {
		setGameData(prev => ({
			...prev,
			currentPassengers: [...prev.currentPassengers, ...accepted],
			rejectedPassegers: [...prev.rejectedPassegers, ...rejected],
		}))
	}

	const disembarkPassengers = useCallback((): void => {
		setGameData(prev => {
			const filtred = filterDisembarkPassengers(prev.currentPassengers)
			const diff = prev.currentPassengers.length - filtred.length

			return {
				...prev,
				balance: prev.balance + FARE * diff,
				currentPassengers: filtred,
			}
		})
	}, [])

	const handleNextState = (): void => {
		setGameState(prev => ({
			state: prev.state === `riding` ? `pickup` : `riding`,
		}))
	}

	const handleNewGame = (): void => {
		setGameState({ state: `riding` })
	}

	// Disembark passengers when arriving on stop
	useEffect(() => {
		if (gameState.state === `pickup`) {
			disembarkPassengers()
		}
	}, [disembarkPassengers, gameState.state])

	// Game over check
	useEffect(() => {
		const isEndGame = gameData.complains.length >= MAX_COMPLAINS

		if (isEndGame) {
			setGameState({ state: `endgame` })
		}
	}, [gameData.complains.length])

	useEffect(() => {
		if (gameData.rejectedPassegers.length === 0) return

		setGameData(prev => ({
			...prev,
			complains: calculateComplains(prev.rejectedPassegers),
		}))
	}, [gameData.rejectedPassegers.length])

	switch (gameState.state) {
		case `onboarding`:
			return <Onboarding startNewGame={handleNewGame} />
		case `endgame`:
			return <EndGame startNewGame={handleNewGame} />
		case `pickup`:
			return <Pickup nextState={handleNextState} updatePassengersData={updatePassengersData} />
		case `riding`:
			return <Riding nextState={handleNextState} passengers={gameData.currentPassengers} />

		default:
			return <Onboarding startNewGame={handleNewGame} />
	}
}
