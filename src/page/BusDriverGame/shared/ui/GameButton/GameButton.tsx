import { FC, PropsWithChildren } from 'react'

import { GameButtonStyled } from './GameButton.styles'

interface IProps {
	onClick: () => void
	disabled?: boolean
}
export const GameButton: FC<PropsWithChildren<IProps>> = ({ children, onClick, disabled }) => (
	<GameButtonStyled onClick={onClick} disabled={disabled}>
		{children}
	</GameButtonStyled>
)
