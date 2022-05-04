import { useTranslation } from 'react-i18next'
import config from 'configs/base'
import { AndrewLytics } from 'helpers/analytics'
import { FeedbackWrapper, FeedbackText } from './styled'

const LeaveFeedbackButton: React.FC<{}> = () => {
	const { t } = useTranslation()

	const onFeedbackClick = () => {
		AndrewLytics('FeedbackClick')
	}

	return (
		<FeedbackWrapper href={config.FEEDBACK_LINK} onClick={onFeedbackClick}>
			<FeedbackText>{t('Leave feedback')}</FeedbackText>
		</FeedbackWrapper>
	)
}

export default LeaveFeedbackButton
