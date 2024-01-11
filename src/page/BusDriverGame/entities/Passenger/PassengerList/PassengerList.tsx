import { FC } from 'react'

import { IPassenger } from '../IPassenger'
import { PassengerAvatar } from '../PassengerAvatar/PassengerAvatar'
import { PassengerListStyled } from './PassengerList.styles'

export const PassengerList: FC<{ list: IPassenger[] }> = ({ list }) => (
	<PassengerListStyled>
		{list.map(passenger => (
			<PassengerAvatar {...passenger} key={passenger.id} />
		))}
	</PassengerListStyled>
)
