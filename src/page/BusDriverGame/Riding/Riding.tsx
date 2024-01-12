import { FC } from 'react'
import { STOPS } from 'shared/store/busStop/const/stops'

import { IPassenger } from '../entities/Passenger/IPassenger'
import { PassengerList } from '../entities/Passenger/PassengerList/PassengerList'
import { GameButton } from '../shared/ui/GameButton/GameButton'
import { RidingStyled } from './Riding.styles'

const getNextStop = (currentStopIndex: number): number => {
	if (STOPS.length - 1 === currentStopIndex) {
		return 0
	}

	return currentStopIndex + 1
}
interface IProps {
	nextState: () => void
	passengers: IPassenger[]
	stopIndex: number
}
export const Riding: FC<IProps> = ({ nextState, passengers, stopIndex }) => {
	const nextStopIndex = getNextStop(stopIndex)

	return (
		<RidingStyled>
			<h1 style={{ fontSize: `20px`, fontWeight: `bold`, alignSelf: `center` }}>
				{` `}
				текущая остановка {STOPS[stopIndex].label}-{stopIndex}
			</h1>

			<PassengerList list={passengers} />

			<GameButton onClick={nextState}>Следующая остановка {STOPS[nextStopIndex].label}</GameButton>
		</RidingStyled>
	)
}
