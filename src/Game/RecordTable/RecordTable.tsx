import React from 'react'
import SVG from 'react-inlinesvg'

import Score from 'Game/Score/Score'
import GameRecord from '../../img/game-record.svg'
import { InfoWrapper, RecordItem, RecordTableContainer, RecordTitle, RecordValue, RecordValueContainer } from './styled'

const RecordTableGameOver: React.FC<{
	score: number
	bestScore?: number
	level: number
	plusNumber: string
	isNewHighScore?: boolean
}> = ({ score, plusNumber, level, isNewHighScore, bestScore }) => {
	return (
		<RecordTableContainer isColumn={true}>
			<Score score={score} plusNumber={plusNumber} isBig isNewHighScore={isNewHighScore} />

			<InfoWrapper>
				<RecordItem style={{ marginRight: '8px' }}>
					<RecordTitle>уровень</RecordTitle>
					<RecordValue>{level}</RecordValue>
				</RecordItem>

				<RecordScore score={bestScore} />
			</InfoWrapper>
		</RecordTableContainer>
	)
}

export const RecordScore: React.FC<{ score?: number }> = ({ score }) => {
	if (score === undefined || score === null) return <></>

	return (
		<RecordItem>
			<RecordTitle>рекорд</RecordTitle>
			<RecordValueContainer>
				<RecordValue style={{ marginRight: '2px' }}>{score}</RecordValue>
				<SVG src={GameRecord} width={19} height={19} uniquifyIDs={true} />
			</RecordValueContainer>
		</RecordItem>
	)
}
const RecordTable: React.FC<{
	score: number
	bestScore?: number
	level: number
	plusNumber: string
	isGameOver?: boolean
	isNewHighScore?: boolean
}> = props => {
	const { score, plusNumber, level, isGameOver, bestScore, isNewHighScore } = props

	if (isGameOver) return <RecordTableGameOver {...props} />

	return (
		<RecordTableContainer isColumn={!!isGameOver}>
			<RecordScore score={bestScore} />

			<Score score={score} plusNumber={plusNumber} isBig={isGameOver} isNewHighScore={!!isNewHighScore} />

			<RecordItem style={{ marginLeft: '2px' }}>
				<RecordTitle>уровень</RecordTitle>
				<RecordValue>{level}</RecordValue>
			</RecordItem>
		</RecordTableContainer>
	)
}

export default RecordTable
