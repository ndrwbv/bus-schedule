import SVG from 'react-inlinesvg'
import GameStart from '../../img/game-star.svg'
import HighScore from '../../img/game-new-high-score.svg'
import * as S from './styled'

interface IProps {
	score: number
	plusNumber: string
	isBig?: boolean
	isNewHighScore?: boolean;
}

const Score: React.FC<IProps> = ({ score, plusNumber, isBig , isNewHighScore = false}) => {
	const iconSize = isBig ? 85 : 45

	console.log(isNewHighScore)
	return (
		<S.Score isBig={!!isBig}>
			<S.ScoreValue>{score}</S.ScoreValue>
			<S.PlusOne animate={plusNumber.length !== 0}>{plusNumber}</S.PlusOne>
			<S.StartContainer isBig={!!isBig}>
				<SVG src={isNewHighScore ? HighScore : GameStart} width={iconSize} height={iconSize} uniquifyIDs={true} />
			</S.StartContainer>
		</S.Score>
	)
}

export default Score
