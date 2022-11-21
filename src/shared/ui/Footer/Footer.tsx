import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router-dom'
import { ABOUT_LINK, AVTOTRANS, AVTOTRANS_LINK, COPYRIGHT } from 'shared/common'
import { AndrewLytics } from 'shared/lib'

import { Container, GrayText } from '../common'
import { FooterStyled } from './styled'

export const Footer = () => {
	const { t } = useTranslation()
	const [searchParams] = useSearchParams()

	return (
		<FooterStyled>
			<Container>
				<div>
					<GrayText>
						<a href={ABOUT_LINK} target="_blank" rel="noreferrer" onClick={() => AndrewLytics(`aboutLink`)}>
							{t(`About`)}
						</a>
					</GrayText>

					<GrayText>
						<Link to={`/game?${searchParams.toString()}`} onClick={() => AndrewLytics(`game.footerPlay`)}>
							Играть
						</Link>
					</GrayText>
					<GrayText>
						{t(`Schedule taken from website`)}
						{` `}
						<a href={AVTOTRANS_LINK} target="_blank" rel="noreferrer">
							{AVTOTRANS}
						</a>
					</GrayText>
					<GrayText>{COPYRIGHT}</GrayText>
				</div>
			</Container>
		</FooterStyled>
	)
}
