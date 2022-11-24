import { useTranslation } from 'react-i18next'
import SVG from 'react-inlinesvg'
import { Link, useSearchParams } from 'react-router-dom'
import { FEEDBACK_LINK } from 'shared/common'
import { AndrewLytics } from 'shared/lib'
import { ContainerStyled } from 'shared/ui'

import Bird from './img/bird-zamanuha.svg'
import { BirdContainerStyled, BirdWrapperStyled, FeedbackLinkStyled, FeedbackTextStyled } from './styled'

export const LeaveFeedbackButton: React.FC = () => {
	const [searchParams] = useSearchParams()
	const { t } = useTranslation()

	const onFeedbackClick = (): void => {
		AndrewLytics(`FeedbackClick`)
	}

	return (
		<ContainerStyled doubled>
			<BirdWrapperStyled>
				<FeedbackLinkStyled href={FEEDBACK_LINK} onClick={onFeedbackClick}>
					<FeedbackTextStyled>{t(`Leave feedback`)}</FeedbackTextStyled>
				</FeedbackLinkStyled>

				<BirdContainerStyled onClick={() => AndrewLytics(`game.birdPlay`)}>
					<Link to={`/game?${searchParams.toString()}`} onClick={() => AndrewLytics(`game.footerPlay`)}>
						<SVG src={Bird} width={32} height={48} uniquifyIDs />
					</Link>
				</BirdContainerStyled>
			</BirdWrapperStyled>
		</ContainerStyled>
	)
}
