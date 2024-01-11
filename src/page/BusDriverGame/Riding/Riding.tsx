import { FC } from 'react'

import { IPassenger } from '../entities/Passenger/IPassenger'
import { PassengerList } from '../entities/Passenger/PassengerList/PassengerList'
import { RidingStyled } from './Riding.styles'

interface IProps {
	nextState: () => void
	passengers: IPassenger[]
}
export const Riding: FC<IProps> = ({ nextState, passengers }) => (
	<RidingStyled>
		<h1>Riding</h1>
		<PassengerList list={passengers} />
		<button type="button" onClick={nextState}>
			Далее
		</button>
	</RidingStyled>
)
