import { FC } from 'react'

import { Character } from '../Character/Character'
import { IPassenger } from '../IPassenger'
import { PassengerListStyled } from './PassengerList.styles'

export const PassengerList: FC<{ list: IPassenger[]; onClick?: (passenger: IPassenger) => void }> = ({
	list,
	onClick = () => {},
}) => (
	<PassengerListStyled>
		{list.map(passenger => (
			<Character key={passenger.id} data={passenger.character} onClick={() => onClick(passenger)} />
		))}
	</PassengerListStyled>
)
