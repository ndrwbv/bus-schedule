import React from 'react'

import { LeftToString } from 'components/HowMuchLeft/HowMuchLeft'
import { GameLink, GameUIContainer } from 'Game/common'
import RecordTable from 'Game/RecordTable/RecordTable'

import { useScheduleContext } from 'context/ScheduleContext'

import { HeaderContainer, Title } from './styled'

interface IGameHeaderProps {
	score: number
	miss: number
	level: number
	timeLeft: { seconds: number } | null
	title: string | null
	isGameOver?: boolean
}

const Header: React.FC<IGameHeaderProps> = ({ score, level, timeLeft, title, isGameOver = false }) => {
	const { busStop, left } = useScheduleContext()

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
				<RecordTable score={score} bestScore={null} left={timeLeft ? timeLeft.seconds : null} level={level} />
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
