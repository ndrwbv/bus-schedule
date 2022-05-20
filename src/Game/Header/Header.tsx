import React from 'react'

import { LeftToString } from 'components/HowMuchLeft/HowMuchLeft'
import { GameLink, GameUIContainer, Title } from 'Game/common'
import RecordTable from 'Game/RecordTable/RecordTable'

import { useScheduleContext } from 'context/ScheduleContext'

import { HeaderContainer } from './styled'

interface IGameHeaderProps {
	score: number
	miss: number
	level: number
	timeLeft: { seconds: number } | null
	title?: string | null
	isGameOver?: boolean
	plusNumber?: string;
}

const Header: React.FC<IGameHeaderProps> = ({ score, level, plusNumber = "", title = null, isGameOver = false }) => {
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
					<RecordTable
						plusNumber={plusNumber}
						score={score}
						bestScore={null}
						level={level}
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
