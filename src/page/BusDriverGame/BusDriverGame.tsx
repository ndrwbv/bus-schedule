import { FC, useCallback, useEffect, useState } from 'react'
import { STOPS } from 'shared/store/busStop/const/stops'

import { FARE } from './const/FARE'
import { MAX_COMPLAINS } from './const/MAX_COMPLAINS'
import { EndGame } from './EndGame/EndGame'
import { generatePassengers } from './entities/Passenger/helpers/generatePassengers'
import { IPassenger } from './entities/Passenger/IPassenger'
import { calculateComplains } from './features/GameComplain/calculateComplains'
import { IGameComplain } from './features/GameComplain/IGameComplain'
import { Onboarding } from './Onboarding/Onboarding'
import { Pickup } from './Pickup/Pickup'
import { Riding } from './Riding/Riding'

type TGameStates = 'onboarding' | 'riding' | 'pickup' | 'endgame'

interface IGameState {
	state: TGameStates
	currentStopIndex: number
}

interface IGameData {
	complains: IGameComplain[]
	balance: number
	transportedPassengers: number
	currentPassengers: IPassenger[]
	rejectedPassegers: IPassenger[]
}

const filterDisembarkPassengers = (passengers: IPassenger[], currentStopIndex: number): IPassenger[] =>
	passengers.filter(passenger => passenger.travel.toStopIndex !== currentStopIndex)

export const BusDriverGame: FC = () => {
	const [gameState, setGameState] = useState<IGameState>({
		state: `onboarding`,
		currentStopIndex: 0,
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
			const filtred = filterDisembarkPassengers(prev.currentPassengers, gameState.currentStopIndex)
			const diff = prev.currentPassengers.length - filtred.length

			return {
				...prev,
				balance: prev.balance + FARE * diff,
				currentPassengers: filtred,
			}
		})
	}, [gameState.currentStopIndex])

	const handleNextState = (): void => {
		setGameState(prev => {
			const nextState = prev.state === `riding` ? `pickup` : `riding`
			let { currentStopIndex } = prev

			if (prev.state === `pickup`) {
				currentStopIndex = STOPS.length - 1 === prev.currentStopIndex ? 0 : prev.currentStopIndex + 1
			}

			return {
				state: nextState,
				currentStopIndex,
			}
		})
	}

	const handleNewGame = (): void => {
		setGameState(prev => ({ ...prev, state: `riding` }))
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
			setGameState(prev => ({ ...prev, state: `endgame` }))
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
			return (
				<Pickup
					nextState={handleNextState}
					updatePassengersData={updatePassengersData}
					waitingPassengers={generatePassengers({
						min: 0,
						max: 3,
						stopIndex: gameState.currentStopIndex,
					})}
				/>
			)
		case `riding`:
			return (
				<Riding
					nextState={handleNextState}
					passengers={gameData.currentPassengers}
					stopIndex={gameState.currentStopIndex}
				/>
			)

		default:
			return <Onboarding startNewGame={handleNewGame} />
	}
}
