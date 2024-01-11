import { FC } from 'react'

import { EndGameStyled } from './EndGame.styles'

interface IProps {
	startNewGame: () => void
}
export const EndGame: FC<IProps> = ({ startNewGame }) => (
	<EndGameStyled>
		{` `}
		EndGame{` `}
		<button type="button" onClick={startNewGame}>
			Новая игра
		</button>
	</EndGameStyled>
)
