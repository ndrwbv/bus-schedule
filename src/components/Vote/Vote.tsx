import { useTranslation } from 'react-i18next'
import SVG from 'react-inlinesvg'
import config from 'configs/base'
import { AndrewLytics } from 'helpers/analytics'
import Bird from '../../img/bird-zamanuha.svg'
import { FeedbackLink, FeedbackText, BirdWrapper, BirdContainer } from './styled'
import { Link, useSearchParams } from 'react-router-dom'

const LeaveFeedbackButton: React.FC<{}> = () => {
	const [searchParams] = useSearchParams()
	const { t } = useTranslation()

	const onFeedbackClick = () => {
		AndrewLytics('FeedbackClick')
	}

	return (
		<BirdWrapper>
			<FeedbackLink href={config.FEEDBACK_LINK} onClick={onFeedbackClick}>
				<FeedbackText>{t('Leave feedback')}</FeedbackText>
			</FeedbackLink>

			<BirdContainer onClick={() => AndrewLytics('game.birdPlay')}>
				<Link to={`/game?${searchParams.toString()}`} onClick={() => AndrewLytics('game.footerPlay')}>
					<SVG src={Bird} width={32} height={48} uniquifyIDs={true} />
				</Link>
			</BirdContainer>
		</BirdWrapper>
	)
}

export default LeaveFeedbackButton
