import { FC } from 'react'

import { IPassenger } from '../entities/Passenger/IPassenger'
import { RidingStyled } from './Riding.styles'

interface IProps {
	nextState: () => void
	passengers: IPassenger[]
}
export const Riding: FC<IProps> = ({ nextState, passengers }) => (
	<RidingStyled>
		Riding
		<button type="button" onClick={nextState}>
			Далее
		</button>
	</RidingStyled>
)
