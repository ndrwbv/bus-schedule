import { FC } from 'react'

import { RidingStyled } from './Riding.styles'

interface IProps {
	nextState: () => void
}
export const Riding: FC<IProps> = ({ nextState }) => (
	<RidingStyled>
		Riding
		<button type="button" onClick={nextState}>
			Далее
		</button>
	</RidingStyled>
)
