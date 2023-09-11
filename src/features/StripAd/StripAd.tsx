import { FC } from 'react'
import { ContainerStyled } from 'shared/ui'

import { BGOverlayStyled, StripAdStyled, StripAdVideoBlockStyled, StripContentStyled } from './StripAd.styles'

export const StripAd: FC = () => {
	return (
		<ContainerStyled>
			<StripAdStyled>
				<StripContentStyled>
					<StripAdVideoBlockStyled>
						скидка 500₽
						<p>На занятия по танцам</p>
						<video src="/public/nastya.mp4" />
					</StripAdVideoBlockStyled>
				</StripContentStyled>
			</StripAdStyled>
			<BGOverlayStyled />
		</ContainerStyled>
	)
}
