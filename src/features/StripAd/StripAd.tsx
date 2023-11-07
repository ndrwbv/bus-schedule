import { FC } from 'react'
import { ContainerStyled } from 'shared/ui'

import { BGOverlayStyled, StripAdStyled, StripAdVideoBlockStyled, StripContentStyled } from './StripAd.styles'

//  <video src="/stripad/nastya.mp4" controls autoPlay muted loop />
export const StripAd: FC = () => {
	return (
		<ContainerStyled>
			<StripAdStyled>
				<StripContentStyled>
					<StripAdVideoBlockStyled>
						скидка 500₽
						<p>На занятия по танцам</p>
						<img src="/stripad/strip-thumbnail.png" alt="thumbnail" />
					</StripAdVideoBlockStyled>
				</StripContentStyled>
			</StripAdStyled>
			<BGOverlayStyled />
		</ContainerStyled>
	)
}
