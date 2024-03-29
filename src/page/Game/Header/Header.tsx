import React from 'react'

import { LeftToString } from 'features/HowMuchLeft'
import { GameLink, GameUIContainer, Title } from 'page/Game/common'
import RecordTable from 'page/Game/RecordTable/RecordTable'

import { HeaderContainer } from './styled'
import { useSelector } from 'react-redux'
import { busStopSelector } from 'shared/store/busStop/busStopInfoSlice'
import { leftSelector } from 'shared/store/timeLeft/timeLeftSlice'

interface IGameHeaderProps {
	score: number
	miss: number
	level: number
	timeLeft: { seconds: number } | null
	title?: string | null
	isGameOver?: boolean
	plusNumber?: string
	bestScore: number
}

const Header: React.FC<IGameHeaderProps> = ({
	score,
	level,
	plusNumber = '',
	title = null,
	isGameOver = false,
	bestScore,
}) => {
	const left = useSelector(leftSelector)
	const busStop = useSelector(busStopSelector)

	return (
		<HeaderContainer fullHeight={isGameOver}>
			{busStop ? (
				<GameUIContainer>
					<GameLink to="/" lowLight={!isGameOver}>
						<LeftToString busStop={'В. Маяковского'} left={left} />
					</GameLink>
				</GameUIContainer>
			) : null}

			<GameUIContainer>
				{title && isGameOver ? (
					<GameUIContainer>
						<Title>{title}</Title>
					</GameUIContainer>
				) : null}

				<GameUIContainer>
					<RecordTable
						plusNumber={plusNumber}
						score={score}
						bestScore={bestScore}
						level={level}
						isGameOver={isGameOver}
					/>
				</GameUIContainer>
			</GameUIContainer>
			{title && !isGameOver ? (
				<GameUIContainer>
					<Title>{title}</Title>
				</GameUIContainer>
			) : null}
		</HeaderContainer>
	)
}

export default Header
