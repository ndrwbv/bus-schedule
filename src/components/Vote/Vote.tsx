import { VoteWrapper, VoteText, VoteButton } from './styled'
import { AndrewLytics } from 'helpers/analytics'

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
				href="https://docs.google.com/forms/d/1CIuACPCB373hVzxHdHsXbjFCkeEA2H7h7IK-CURqh2o/viewform?edit_requested=true"
				target="_blank"
				rel="noopener"
			>
				Оставить отзыв
			</VoteButton>
		</VoteWrapper>
	)
}

export default Vote
