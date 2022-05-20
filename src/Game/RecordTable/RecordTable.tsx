import React from 'react'
import { PlusOne, RecordItem, RecordTableContainer, RecordTitle, RecordValue, Score } from './styled'

const RecordTable: React.FC<{
	score: number
	bestScore: number | null
	level: number
	plusNumber: string
}> = ({ score, plusNumber, bestScore }) => {
	return (
		<RecordTableContainer>
			<RecordItem>
				<RecordTitle>Рекорд</RecordTitle>
				<RecordValue>{score}</RecordValue>
			</RecordItem>

			<Score>
				<RecordValue>{score}</RecordValue>
				<PlusOne animate={plusNumber.length !== 0}>{plusNumber}</PlusOne>
			</Score>

			<RecordItem>
				<RecordValue>{bestScore ?? '-'}</RecordValue>
			</RecordItem>
		</RecordTableContainer>
	)
}

export default RecordTable
