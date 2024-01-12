import { FC, PropsWithChildren } from 'react'

import { GameButtonStyled } from './GameButton.styles'

interface IProps {
	onClick: () => void
}
export const GameButton: FC<PropsWithChildren<IProps>> = ({ children, onClick }) => (
	<GameButtonStyled onClick={onClick}>{children}</GameButtonStyled>
)
