import SVG from 'react-inlinesvg'
import VoteCloseCross from 'img/voteclosecross.svg'
import { VoteWrapper, VoteText, VoteButton, VoteCloseButton } from './styled'

const Vote: React.FC<{
	hideCross: boolean
	onCrossClick?: () => void
	onVoteClick: () => void
}> = ({ hideCross, onCrossClick, onVoteClick }) => {
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
			{!hideCross && (
				<VoteCloseButton onClick={onCrossClick}>
					<SVG className="closebutton" src={VoteCloseCross} />
				</VoteCloseButton>
			)}
		</VoteWrapper>
	)
}

export default Vote
