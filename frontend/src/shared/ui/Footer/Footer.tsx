import { Link, useSearchParams } from 'react-router-dom'
import { ABOUT_LINK, COPYRIGHT } from 'shared/common'
import { AndrewLytics } from 'shared/lib'

import { ContainerStyled, GrayTextStyled } from '../common'
import { FooterStyled } from './styled'

export const Footer: React.FC = () => {
	const [searchParams] = useSearchParams()

	return (
		<FooterStyled>
			<ContainerStyled>
				<div>
					<GrayTextStyled>
						<Link to={`/game?${searchParams.toString()}`} onClick={() => AndrewLytics(`game.footerPlay`)}>
							Играть
						</Link>
					</GrayTextStyled>
					<GrayTextStyled>
						<a href={ABOUT_LINK} target="_blank" rel="noopener noreferrer">
							{COPYRIGHT}
						</a>
					</GrayTextStyled>
				</div>
			</ContainerStyled>
		</FooterStyled>
	)
}
