import React, { useMemo } from 'react'

import { getDirectionString, getHumanDate, getTypeString } from '../helpers'
import { ComplainType } from '../model/Complains'
import { IComplainsResponse } from '../model/useComplains'
import { ComplainsDirectionStyled, ComplainsStopStyled, MessageContainerStyled, MessageDateStyled } from './styled'

type Props = IComplainsResponse & { isCurrentStop?: boolean }

export const ComplainsMessage: React.FC<Props> = ({ date, type, direction, stop, isCurrentStop = false }) => {
	const left = useMemo(() => getHumanDate(date), [date])
	const directionString = getDirectionString(direction)
	const typeString = getTypeString(type as ComplainType)

	return (
		<MessageContainerStyled>
			<ComplainsStopStyled $isCurrentStop={isCurrentStop}>{stop}</ComplainsStopStyled>
			<ComplainsDirectionStyled>{directionString}</ComplainsDirectionStyled>
			<p>{typeString}</p>
			<MessageDateStyled>{left}</MessageDateStyled>
		</MessageContainerStyled>
	)
}
