import HowMuchLeft from 'components/HowMuchLeft/HowMuchLeft'
import { useScheduleContext } from 'context/ScheduleContext'
import React from 'react'
import * as S from './styled'

interface IGameHeaderProps {
	score: number
	miss: number
	level: number
	timeLeft: { seconds: number }
}

const GameHeader: React.FC<IGameHeaderProps> = ({ score, miss, level, timeLeft }) => {
	const {
		busStop,
		left,
		shouldShowFastReply,

		todaysHoliday,
	} = useScheduleContext()

	return (
		<>
			<HowMuchLeft
				holiday={todaysHoliday}
				busStop={busStop}
				left={left}
				shouldShowFastReply={shouldShowFastReply}
			/>
			<S.GameTitle>
				{score} - {miss} - {level} - {timeLeft.seconds}
			</S.GameTitle>
			<S.GameTitle>Найдите дубли</S.GameTitle>
		</>
	)
}

export default GameHeader
