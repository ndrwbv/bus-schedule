import { useTranslation } from 'react-i18next'
import config from 'configs/base'
import { AndrewLytics } from 'helpers/analytics'
import { VoteWrapper, VoteText, VoteButton } from './styled'

const Vote: React.FC<{}> = () => {
	const { t } = useTranslation()

	const onVoteClick = () => {
		AndrewLytics('voteClick')
	}

	return (
		<VoteWrapper>
			<VoteText>
				{t('We add')}
				<br />
				{t('new stops')}
			</VoteText>
			<VoteButton onClick={onVoteClick} href={config.FEEDBACK_LINK} target="_blank" rel="noopener">
				{t('Leave feedback')}
			</VoteButton>
		</VoteWrapper>
	)
}

export default Vote
