import { VoteWrapper, VoteText, VoteButton } from './styled'
import { AndrewLytics } from 'helpers/analytics'
import config from 'configs/base'

const Vote: React.FC<{}> = () => {
	const onVoteClick = () => {
		AndrewLytics('voteClick')
	}

	return (
		<VoteWrapper>
			<VoteText>
				Мы добавили
				<br />
				новые остановки
			</VoteText>
			<VoteButton
				onClick={onVoteClick}
				href={config.FEEDBACK_LINK}
				target="_blank"
				rel="noopener"
			>
				Оставить отзыв
			</VoteButton>
		</VoteWrapper>
	)
}

export default Vote
