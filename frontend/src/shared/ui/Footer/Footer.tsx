import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router-dom'
import { ABOUT_LINK, AVTOTRANS, AVTOTRANS_LINK, COPYRIGHT } from 'shared/common'
import { AndrewLytics } from 'shared/lib'

import { ContainerStyled, GrayTextStyled } from '../common'
import { FooterStyled } from './styled'

export const Footer: React.FC = () => {
	const { t } = useTranslation()
	const [searchParams] = useSearchParams()

	return (
		<FooterStyled>
			<ContainerStyled>
				<div>
					<GrayTextStyled>
						<a href={ABOUT_LINK} target="_blank" rel="noreferrer" onClick={() => AndrewLytics(`aboutLink`)}>
							{t(`About`)}
						</a>
					</GrayTextStyled>

					<GrayTextStyled>
						<Link to={`/game?${searchParams.toString()}`} onClick={() => AndrewLytics(`game.footerPlay`)}>
							Играть
						</Link>
					</GrayTextStyled>
					<GrayTextStyled>
						{t(`Schedule taken from website`)}
						{` `}
						<a href={AVTOTRANS_LINK} target="_blank" rel="noreferrer">
							{AVTOTRANS}
						</a>
					</GrayTextStyled>
					<GrayTextStyled>{COPYRIGHT}</GrayTextStyled>
				</div>
			</ContainerStyled>
		</FooterStyled>
	)
}
