import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { STOPS } from 'shared/store/busStop/const/stops'

import { FARE } from './const/FARE'
import { MAX_COMPLAINS } from './const/MAX_COMPLAINS'
import { EndGame } from './EndGame/EndGame'
import { GameLayout, IGameScoreItem } from './entities/GameLayout/GameLayout'
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

const INITIAL_GAME_DATA = {
	complains: [],
	balance: 0,
	transportedPassengers: 0,
	currentPassengers: [],
	rejectedPassegers: [],
}

export const BusDriverGame: FC = () => {
	const [gameState, setGameState] = useState<IGameState>({
		state: `onboarding`,
		currentStopIndex: 0,
	})
	const [passengersLimit, setPassengersLimit] = useState(5)

	const [gameData, setGameData] = useState<IGameData>(INITIAL_GAME_DATA)

	const addNewPassenger = (passenger: IPassenger): void => {
		setGameData(prev => ({
			...prev,
			currentPassengers: [...prev.currentPassengers, passenger],
		}))
	}

	const rejectPassenger = (passenger: IPassenger): void => {
		setGameData(prev => ({
			...prev,
			rejectedPassegers: [...prev.rejectedPassegers, passenger],
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
				transportedPassengers: prev.transportedPassengers + diff,
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
		setGameState({ currentStopIndex: 0, state: `riding` })
		setGameData(INITIAL_GAME_DATA)
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

	useEffect(() => {
		setPassengersLimit(gameData.transportedPassengers + 5)
	}, [gameData.transportedPassengers])

	const renderContent = (): JSX.Element => {
		switch (gameState.state) {
			case `onboarding`:
				return <Onboarding startNewGame={handleNewGame} />

			case `endgame`:
				return (
					<EndGame startNewGame={handleNewGame} complains={gameData.complains} balance={gameData.balance} />
				)

			case `pickup`:
				return (
					<Pickup
						nextState={handleNextState}
						acceptPassenger={addNewPassenger}
						rejectPassenger={rejectPassenger}
						waitingPassengers={generatePassengers({
							min: 0,
							max: 3,
							stopIndex: gameState.currentStopIndex,
						})}
						limit={passengersLimit}
						total={gameData.currentPassengers.length}
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

	const gameScore: IGameScoreItem[] = useMemo(
		() => [
			{
				value: gameData.balance,
				label: `баланс`,
			},
			{
				value: `${gameData.currentPassengers.length} / ${passengersLimit}`,
				label: `пассажиры`,
			},
			{
				value: gameData.complains.length,
				label: `жалобы`,
			},
		],
		[gameData.balance, gameData.complains.length, gameData.currentPassengers.length, passengersLimit],
	)

	return <GameLayout items={gameScore}>{renderContent()}</GameLayout>
}
