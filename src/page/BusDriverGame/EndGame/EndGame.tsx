import { FC } from 'react'

import { PassengerAvatar } from '../entities/Passenger/PassengerAvatar/PassengerAvatar'
import { IGameComplain } from '../features/GameComplain/IGameComplain'
import { GameButton } from '../shared/ui/GameButton/GameButton'
import { ComplainsListStyled, EndGameStyled } from './EndGame.styles'

interface IProps {
	startNewGame: () => void
	complains: IGameComplain[]
	balance: number
}
export const EndGame: FC<IProps> = ({ startNewGame, complains }) => (
	<EndGameStyled>
		<h1 style={{ fontSize: `20px`, fontWeight: `bold`, alignSelf: `center` }}>Игра окончена</h1>

		<ComplainsListStyled>
			{complains.map(complain => (
				<div key={complain.passenger.id}>
					<PassengerAvatar {...complain.passenger} />
					{complain.message}
				</div>
			))}
		</ComplainsListStyled>

		<GameButton onClick={startNewGame}>Новая игра</GameButton>
	</EndGameStyled>
)
