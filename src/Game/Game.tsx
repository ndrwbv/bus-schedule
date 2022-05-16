import { useState } from 'react'
import * as S from './styled'

type ID = number
interface IGameData {
	id: ID
	text: string
	selected: boolean
	destroyed: boolean
}

const DATA: IGameData[] = [
	{ id: 1, text: '14:08', selected: false, destroyed: false },
	{ id: 2, text: '14:08', selected: false, destroyed: false },
	{ id: 3, text: '12:08', selected: false, destroyed: false },
	{ id: 4, text: '12:08', selected: false, destroyed: false },

	{ id: 5, text: '13:08', selected: false, destroyed: false },
	{ id: 6, text: '13:08', selected: false, destroyed: false },
	{ id: 7, text: '16:08', selected: false, destroyed: false },
	{ id: 8, text: '16:08', selected: false, destroyed: false },

	{ id: 9, text: '17:08', selected: false, destroyed: false },
	{ id: 10, text: '17:08', selected: false, destroyed: false },
	{ id: 11, text: '18:08', selected: false, destroyed: false },
	{ id: 12, text: '18:08', selected: false, destroyed: false },
]

const Game = () => {
	const [levelData, setLevelData] = useState<IGameData[]>(DATA)
	const [score, setScore] = useState(0)
	const [miss, setMiss] = useState(0)

	const handleClickTimeCode = (_cell: IGameData) => {
		if (_cell.destroyed || _cell.selected) return

		setLevelData(prevState => {
			const firstSelected = prevState.find(l => l.selected)

			const secondSelected = firstSelected
				? prevState.find(pretendet => {
						if (
							firstSelected.text === pretendet.text &&
							firstSelected.id !== pretendet.id &&
							_cell.id === pretendet.id
						) {
							return true
						}

						return false
				  })
				: undefined

			const isMissed = firstSelected && !secondSelected
			const isWin = firstSelected && secondSelected

			if (isMissed) {
				setMiss(prev => prev + 1)
			}

			if (isWin) {
				setScore(prev => prev + 1)
			}

			return prevState.map(cell => {
				if (isMissed) {
					return {
						...cell,
						selected: false,
					}
				}

				if (isWin) {
					if (cell.id === firstSelected.id || secondSelected.id === cell.id) {
						return {
							...cell,
							selected: false,
							destroyed: true,
						}
					}
				}

				return cell.id === _cell.id ? { ...cell, selected: true } : cell
			})
		})
	}

	return (
		<S.GameInner>
			<S.GameTitle>
				{score} - {miss}
			</S.GameTitle>
			<S.GameTitle>Найдите дубли</S.GameTitle>
			<S.GameContainer>
				{levelData.map(cell => (
					<S.GameCell
						key={cell.id}
						onClick={() => handleClickTimeCode(cell)}
						selected={cell.selected}
						destroyed={cell.destroyed}
					>
						{cell.text}
					</S.GameCell>
				))}
			</S.GameContainer>
		</S.GameInner>
	)
}

export default Game
