import { FC } from 'react';
import { IPassenger } from '../IPassenger';

export const PassengerDetails: FC<IPassenger> = ({ name }) => {
	return (
		<div>
			<div>{name}</div>
		</div>
	);
};
