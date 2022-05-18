import { useEffect, useState } from 'react'
import { MIN_ELEMENTS, MAX_MISS, INIT_SCORE, INIT_MISS, INIT_LEVEL, INIT_GAME_OVER, ONE_ROW } from './const'
import Header from './Header/Header'
import { calculateTimeLeft, generateGameLevel } from './helpers'
import { GameButton, GameLayout, GameLayoutCentred } from './common'
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

	const [date, setDate] = useState(new Date().getTime())
	const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(date))

	useEffect(() => {
		const timer = setTimeout(() => {
			setTimeLeft(calculateTimeLeft(date, level * 0.1))
		}, 1)

		return () => clearTimeout(timer)
	})

	const handleNewGame = () => {
		setDate(new Date().getTime())
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

	const generateAmount = (currentLevel: number) => {
		if (currentLevel >= 14) return ONE_ROW * 6
		if (currentLevel >= 12) return ONE_ROW * 5
		if (currentLevel >= 9) return ONE_ROW * 4
		if (currentLevel >= 5) return ONE_ROW * 3
		if (currentLevel >= 2) return ONE_ROW * 2

		if (currentLevel >= 1) return ONE_ROW

		return ONE_ROW
	}

	useEffect(() => {
		// new level
		const isEveryCellDestroyed = levelData.every(cell => cell.destroyed === true)

		if (isEveryCellDestroyed) {
			setLevel(prev => prev + 1)
			const amount = generateAmount(level)
			setLevelData(generateGameLevel(amount))
		}
	}, [levelData, level])

	useEffect(() => {
		if (miss > MAX_MISS || timeLeft.seconds === 0) setGameOver(true)
	}, [miss, timeLeft])

	if (isGameOver)
		return (
			<GameLayoutCentred>
				<Header score={score} miss={miss} level={level} timeLeft={null} title={'Игра окончена'} isGameOver />

				<GameButton onClick={handleNewGame}>Играть еще</GameButton>
			</GameLayoutCentred>
		)

	return (
		<GameLayout>
			<Header score={score} miss={miss} level={level} timeLeft={timeLeft} title={'Найдите дубли'} />

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
		</GameLayout>
	)
}

export default Game
