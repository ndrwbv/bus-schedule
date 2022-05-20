import SVG from 'react-inlinesvg'
import GameStart from '../../img/game-star.svg'
import * as S from './styled'

interface IProps {
	score: number
	plusNumber: string
	isBig?: boolean
}

const Score: React.FC<IProps> = ({ score, plusNumber, isBig }) => {
	const iconSize = isBig ? 85 : 45

	return (
		<S.Score isBig={!!isBig}>
			<S.ScoreValue>{score}</S.ScoreValue>
			<S.PlusOne animate={plusNumber.length !== 0}>{plusNumber}</S.PlusOne>
			<S.StartContainer isBig={!!isBig}>
				<SVG src={GameStart} width={iconSize} height={iconSize} uniquifyIDs={true} />
			</S.StartContainer>
		</S.Score>
	)
}

export default Score
