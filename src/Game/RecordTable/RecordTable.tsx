import React from 'react'
import SVG from 'react-inlinesvg'

import Score from 'Game/Score/Score'
import GameRecord from '../../img/game-record.svg'
import { InfoWrapper, RecordItem, RecordTableContainer, RecordTitle, RecordValue, RecordValueContainer } from './styled'

const RecordTableGameOver: React.FC<{
	score: number
	bestScore: number | null
	level: number
	plusNumber: string
}> = ({ score, plusNumber, level }) => {
	return (
		<RecordTableContainer isColumn={true}>
			<Score score={score} plusNumber={plusNumber} isBig />

			<InfoWrapper>
				<RecordItem style={{ marginRight: '8px' }}>
					<RecordTitle>уровень</RecordTitle>
					<RecordValue>{level}</RecordValue>
				</RecordItem>

				<RecordScore score={score} />
			</InfoWrapper>
		</RecordTableContainer>
	)
}

export const RecordScore: React.FC<{ score: number }> = ({ score }) => {
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
	bestScore: number | null
	level: number
	plusNumber: string
	isGameOver?: boolean
}> = props => {
	const { score, plusNumber, level, isGameOver } = props

	if (isGameOver) return <RecordTableGameOver {...props} />

	return (
		<RecordTableContainer isColumn={!!isGameOver}>
			<RecordScore score={score} />

			<Score score={score} plusNumber={plusNumber} isBig={isGameOver} />

			<RecordItem style={{ marginLeft: '2px' }}>
				<RecordTitle>уровень</RecordTitle>
				<RecordValue>{level}</RecordValue>
			</RecordItem>
		</RecordTableContainer>
	)
}

export default RecordTable
