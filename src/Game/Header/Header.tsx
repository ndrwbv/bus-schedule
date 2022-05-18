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

const Header: React.FC<IGameHeaderProps> = ({ score, miss, level, timeLeft, title, isGameOver = false }) => {
	const {
		busStop,
		left,
		shouldShowFastReply,

		todaysHoliday,
	} = useScheduleContext()

	console.log(busStop)
	return (
		<HeaderContainer fullHeight={isGameOver}>
			<GameUIContainer>
				<GameLink to="/" lowLight={!isGameOver}>
					<LeftToString busStop={'В. Маяковского'} left={{ minutes: 20, hours: 0 }} />
				</GameLink>
			</GameUIContainer>

			{title && isGameOver ? (
				<GameUIContainer>
					<Title>{title}</Title>
				</GameUIContainer>
			) : null}

			<GameUIContainer>
				<RecordTable score={score} bestScore={null} left={timeLeft ? timeLeft.seconds : null} level={level} />
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
