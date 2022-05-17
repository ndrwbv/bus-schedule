import { useEffect, useState } from 'react'
import { MIN_ELEMENTS, MAX_ELEMENTS, MAX_MISS, INIT_SCORE, INIT_MISS, INIT_LEVEL, INIT_GAME_OVER } from './const'
import { generateGameLevel } from './helpers'
import * as S from './styled'

type ID = number
export interface IGameData {
	id: ID
	text: string
	selected: boolean
	destroyed: boolean
}

const Game = () => {
	const [levelData, setLevelData] = useState<IGameData[]>(generateGameLevel(MIN_ELEMENTS))
	const [score, setScore] = useState(INIT_SCORE)
	const [miss, setMiss] = useState(INIT_MISS)
	const [level, setLevel] = useState(INIT_LEVEL)
	const [isGameOver, setGameOver] = useState(INIT_GAME_OVER)

	const handleNewGame = () => {
		setLevelData(generateGameLevel(MIN_ELEMENTS))
		setScore(INIT_SCORE)
		setMiss(INIT_MISS)
		setLevel(INIT_LEVEL)
		setGameOver(INIT_GAME_OVER)
	}

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

	useEffect(() => {
		const isEveryCellDestroyed = levelData.every(cell => cell.destroyed === true)

		if (isEveryCellDestroyed) {
			const newAmount = levelData.length + 4
			const amount = newAmount >= MAX_ELEMENTS ? MAX_ELEMENTS : newAmount

			setLevel(prev => prev + 1)
			setLevelData(generateGameLevel(amount))
		}
	}, [levelData])

	useEffect(() => {
		if (miss > MAX_MISS) setGameOver(true)
	}, [miss])

	if (isGameOver)
		return (
			<S.GameInner>
				<S.GameTitle>Очки: {score}</S.GameTitle>
				<S.GameTitle>Уровень: {level}</S.GameTitle>

				<S.GameTitle>Игра окончена</S.GameTitle>
				<S.GameButton onClick={handleNewGame}>Играть еще</S.GameButton>
			</S.GameInner>
		)

	return (
		<S.GameInner>
			<S.GameTitle>
				{score} - {miss} - {level}
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
