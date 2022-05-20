import { useEffect, useState } from 'react'
import { MIN_ELEMENTS, MAX_MISS, INIT_SCORE, INIT_MISS, INIT_LEVEL, INIT_GAME_OVER, ONE_ROW } from './const'
import Header from './Header/Header'
import { calculateTimeLeft, generateGameLevel } from './helpers'
import { GameButton, GameLayout, GameLayoutCentred, MainGameLayout } from './common'
import ProgressBar from './ProgressBar/ProgressBar'
import * as S from './styled'

type ID = number
export interface IGameData {
	id: ID
	text: string
	selected: boolean
	destroyed: boolean
}

const devMode = localStorage.getItem('devMode') === '1'
const Game = () => {
	const [levelData, setLevelData] = useState<IGameData[]>(generateGameLevel(MIN_ELEMENTS))
	const [score, setScore] = useState(INIT_SCORE)
	const [miss, setMiss] = useState(INIT_MISS)
	const [level, setLevel] = useState(INIT_LEVEL)
	const [isGameOver, setGameOver] = useState(INIT_GAME_OVER)

	const [date, setDate] = useState(new Date().getTime())
	const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(date))
	const [isNewLevelWin, setNewLeveWin] = useState(true)
	const [isPairWin, setPairWin] = useState(false)
	const [shoudlShowplusNumber, setShouldShowplusNumber] = useState(false)

	useEffect(() => {
		if (!isGameOver && miss > MAX_MISS) {
			setGameOver(true)
		}
	}, [miss, isGameOver])

	useEffect(() => {
		if (!isGameOver && timeLeft.seconds === 0) {
			setGameOver(true)
		}
	}, [timeLeft, isGameOver])

	useEffect(() => {
		if (timeLeft.seconds === 0) return

		const timer = setTimeout(() => {
			setTimeLeft(calculateTimeLeft(date, level * 0.11))
		}, 1)

		return () => clearTimeout(timer)
	}, [timeLeft, level, date])

	const handleNewGame = () => {
		setGameOver(INIT_GAME_OVER)
		setTimeLeft(calculateTimeLeft(new Date().getTime(), 0.15))

		setLevelData(generateGameLevel(MIN_ELEMENTS))
		setScore(INIT_SCORE)
		setLevel(INIT_LEVEL)
		setMiss(INIT_MISS)
		setDate(new Date().getTime())
		setNewLeveWin(true)
		setShouldShowplusNumber(false)
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
		if (isNewLevelWin) {
			setTimeout(() => {
				setNewLeveWin(false)
				!shoudlShowplusNumber && setShouldShowplusNumber(true)
			}, 2000)
		}
	}, [isNewLevelWin, shoudlShowplusNumber])

	useEffect(() => {
		if (isPairWin) {
			setTimeout(() => {
				setPairWin(false)
			}, 500)
		}
	}, [isPairWin])

	useEffect(() => {
		// new level
		const isEveryCellDestroyed = levelData.every(cell => cell.destroyed === true)

		if (isEveryCellDestroyed) {
			setLevel(prev => prev + 1)
			const amount = generateAmount(level)
			setLevelData(generateGameLevel(amount))
			setNewLeveWin(true)
		}
	}, [levelData, level])

	useEffect(() => {
		setPairWin(true)
	}, [score])

	const getPercentage = () => {
		if (timeLeft.seconds === 0) return 100
		if (timeLeft.seconds === 1) return 100
		if (timeLeft.seconds === 2) return 95
		if (timeLeft.seconds === 3) return 80
		if (timeLeft.seconds === 4) return 70
		if (timeLeft.seconds === 5) return 60
		if (timeLeft.seconds === 6) return 50
		if (timeLeft.seconds === 7) return 40
		if (timeLeft.seconds === 8) return 30
		if (timeLeft.seconds === 9) return 20
		if (timeLeft.seconds === 10) return 10

		return (timeLeft.seconds * 60) / 100
	}

	if (isGameOver && !devMode)
		return (
			<MainGameLayout isWin={false}>
				<GameLayoutCentred>
					<Header
						score={score}
						miss={miss}
						level={level}
						timeLeft={null}
						title={'Игра окончена'}
						isGameOver
					/>

					<GameButton onClick={handleNewGame}>Играть еще</GameButton>
				</GameLayoutCentred>
			</MainGameLayout>
		)

	return (
		<MainGameLayout isWin={shoudlShowplusNumber ? isNewLevelWin : false}>
			<GameLayout>
				<ProgressBar completed={getPercentage()} bgcolor={'#F48400'} />
				<Header
					plusNumber={isPairWin && shoudlShowplusNumber ? '+1' : ''}
					score={score}
					miss={miss}
					level={level}
					timeLeft={timeLeft}
				/>

				<S.GameContainer animate={isNewLevelWin}>
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
		</MainGameLayout>
	)
}

export default Game
