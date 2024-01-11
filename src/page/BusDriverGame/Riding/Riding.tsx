import { FC } from 'react'
import { STOPS } from 'shared/store/busStop/const/stops'

import { IPassenger } from '../entities/Passenger/IPassenger'
import { PassengerList } from '../entities/Passenger/PassengerList/PassengerList'
import { RidingStyled } from './Riding.styles'

interface IProps {
	nextState: () => void
	passengers: IPassenger[]
	stopIndex: number
}
export const Riding: FC<IProps> = ({ nextState, passengers, stopIndex }) => (
	<RidingStyled>
		<h1>Riding</h1>
		<span>
			текущая остановка {STOPS[stopIndex].label}-{stopIndex}
		</span>
		<PassengerList list={passengers} />
		<button type="button" onClick={nextState}>
			Далее
		</button>
	</RidingStyled>
)
