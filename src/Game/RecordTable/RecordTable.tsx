import React from 'react'
import { RecordItem, RecordTableContainer, RecordTitle, RecordValue } from './styled'

const RecordTable: React.FC<{
	score: number
	bestScore: number | null
	level: number
	left: number | null
}> = ({ score, left, level, bestScore }) => {
	return (
		<RecordTableContainer>
			<RecordItem>
				<RecordTitle>Очки</RecordTitle>
				<RecordValue>{score}</RecordValue>
			</RecordItem>

			<RecordItem>
				<RecordTitle>Уровень</RecordTitle>
				<RecordValue>{level}</RecordValue>
			</RecordItem>

			<RecordItem>
				<RecordTitle>Рекорд</RecordTitle>
				<RecordValue>{bestScore ?? '-'}</RecordValue>
			</RecordItem>

			{left ? (
				<RecordItem>
					<RecordTitle>Время</RecordTitle>
					<RecordValue>{left}</RecordValue>
				</RecordItem>
			) : null}
		</RecordTableContainer>
	)
}

export default RecordTable
