import { FC } from 'react'

import { IPassenger } from '../entities/Passenger/IPassenger'
import { PickupStyled } from './Pickup.styles'

interface IProps {
	nextState: () => void
	updatePassengersData: (accepted: IPassenger[], rejected: IPassenger[]) => void
}
export const Pickup: FC<IProps> = ({ nextState, updatePassengersData }) => (
	<PickupStyled>
		Pickup{` `}
		<button type="button" onClick={nextState}>
			Далее
		</button>
	</PickupStyled>
)
