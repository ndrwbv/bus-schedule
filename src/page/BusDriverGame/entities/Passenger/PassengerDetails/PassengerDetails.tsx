import { FC } from 'react'

import { IPassenger } from '../IPassenger'
import { PassengerDetailsStyled } from './PassengerDetails.styles'

export const PassengerDetails: FC<IPassenger> = ({ name, secondName, zodiakSign, occupation }) => {
	return (
		<PassengerDetailsStyled>
			<div>имя: {name}</div>
			<div>фамилия: {secondName}</div>
			<div>знак: {zodiakSign}</div>
			<div>род деятельности: {occupation}</div>
		</PassengerDetailsStyled>
	)
}
