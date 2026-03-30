import { Link, useSearchParams } from 'react-router-dom'
import { COPYRIGHT } from 'shared/common'
import { AndrewLytics } from 'shared/lib'

import { ContainerStyled, GrayTextStyled } from '../common'
import { FooterLinkStyled, FooterStyled } from './styled'

export const Footer: React.FC<{ onAbout?: () => void }> = ({ onAbout }) => {
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
						{onAbout ? (
							<FooterLinkStyled onClick={onAbout}>{COPYRIGHT}</FooterLinkStyled>
						) : (
							COPYRIGHT
						)}
					</GrayTextStyled>
				</div>
			</ContainerStyled>
		</FooterStyled>
	)
}
