import { FC } from 'react'

import { PickupStyled } from './Pickup.styles'

interface IProps {
	nextState: () => void
}
export const Pickup: FC<IProps> = ({ nextState }) => (
	<PickupStyled>
		Pickup{` `}
		<button type="button" onClick={nextState}>
			Далее
		</button>
	</PickupStyled>
)
