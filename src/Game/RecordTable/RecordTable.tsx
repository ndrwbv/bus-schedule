import React from 'react'
import { InfoWrapper, RecordItem, RecordTableContainer, RecordTitle, RecordValue } from './styled'
import Score from 'Game/Score/Score'

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
				<RecordItem>
					<RecordTitle>уровень</RecordTitle>
					<RecordValue>{level}</RecordValue>
				</RecordItem>

				<RecordItem style={{ marginLeft: '12px' }}>
					<RecordTitle>рекорд</RecordTitle>
					<RecordValue>{score}</RecordValue>
				</RecordItem>
			</InfoWrapper>
		</RecordTableContainer>
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
			<RecordItem>
				<RecordTitle>рекорд</RecordTitle>
				<RecordValue>{score}</RecordValue>
			</RecordItem>

			<Score score={score} plusNumber={plusNumber} isBig={isGameOver} />

			<RecordItem>
				<RecordTitle>уровень</RecordTitle>
				<RecordValue>{level}</RecordValue>
			</RecordItem>
		</RecordTableContainer>
	)
}

export default RecordTable
