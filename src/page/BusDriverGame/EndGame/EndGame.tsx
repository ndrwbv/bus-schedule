import { FC } from 'react'

import { PassengerAvatar } from '../entities/Passenger/PassengerAvatar/PassengerAvatar'
import { IGameComplain } from '../features/GameComplain/IGameComplain'
import { EndGameStyled } from './EndGame.styles'

interface IProps {
	startNewGame: () => void
	complains: IGameComplain[]
	balance: number
}
export const EndGame: FC<IProps> = ({ startNewGame, balance, complains }) => (
	<EndGameStyled>
		{` `}
		EndGame{` `}
		{complains.map(complain => (
			<div>
				<PassengerAvatar {...complain.passenger} />
				{complain.message}
			</div>
		))}
		<span>Баланс: {balance}</span>
		<button type="button" onClick={startNewGame}>
			Новая игра
		</button>
	</EndGameStyled>
)
