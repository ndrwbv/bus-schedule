import { useTranslation } from 'react-i18next'
import config from 'configs/base'
import { AndrewLytics } from 'helpers/analytics'
import { VoteWrapper, VoteText } from './styled'

const Vote: React.FC<{}> = () => {
	const { t } = useTranslation()

	const onVoteClick = () => {
		AndrewLytics('voteClick')
	}

	return (
		<VoteWrapper href={config.FEEDBACK_LINK} onClick={onVoteClick}>
			<VoteText>{t('Leave feedback')}</VoteText>
		</VoteWrapper>
	)
}

export default Vote
