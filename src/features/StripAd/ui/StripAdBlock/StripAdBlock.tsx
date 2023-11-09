import { FC } from 'react'

import { StripHeader } from '../StripHeader/StripHeader'
import { StripAdStyled, StripAdVideoBlockStyled, StripTextBlockStyled } from './StripAdBlock.styles'

interface IStripAdBlockProps {
	onOpen: () => void
}

export const StripAdBlock: FC<IStripAdBlockProps> = ({ onOpen }) => {
	return (
		<StripAdStyled onClick={onOpen}>
			<StripAdVideoBlockStyled>
				<StripTextBlockStyled>
					<StripHeader arrow />
				</StripTextBlockStyled>
			</StripAdVideoBlockStyled>
		</StripAdStyled>
	)
}
