import { COPYRIGHT } from 'shared/common'

import { ContainerStyled, GrayTextStyled } from '../common'
import { FooterStyled } from './styled'

export const Footer: React.FC = () => (
	<FooterStyled>
		<ContainerStyled>
			<div>
				<GrayTextStyled>{COPYRIGHT}</GrayTextStyled>
				<GrayTextStyled>v{__APP_VERSION__}</GrayTextStyled>
			</div>
		</ContainerStyled>
	</FooterStyled>
)
