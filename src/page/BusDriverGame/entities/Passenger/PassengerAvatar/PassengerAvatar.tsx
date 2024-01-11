import { FC } from 'react'

import { IPassenger } from '../IPassenger'
import { PassengerAvatarStyled } from './PassengerAvatar.styles'

export const PassengerAvatar: FC<IPassenger> = ({ name, travel, secondName }) => (
	<PassengerAvatarStyled>
		{name}/{secondName}/{travel.fromStopIndex}-{travel.toStopIndex}
	</PassengerAvatarStyled>
)
