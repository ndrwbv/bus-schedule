import { FC } from 'react'

import { IPassenger } from '../IPassenger'

export const PassengerDetails: FC<IPassenger> = ({ name, secondName, zodiakSign, occupation }) => {
	return (
		<div>
			<div>имя: {name}</div>
			<div>фамилия: {secondName}</div>
			<div>{zodiakSign}</div>
			<div>{occupation}</div>
		</div>
	)
}
