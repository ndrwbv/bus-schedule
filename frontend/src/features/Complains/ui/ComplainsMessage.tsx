import React, { useMemo } from 'react'

import { getDirectionString, getHumanDate, getOnString } from '../helpers'
import { IComplainsResponse } from '../model/useComplains'
import { ComplainsDirectionStyled, ComplainsStopStyled, MessageContainerStyled, MessageDateStyled } from './styled'

type Props = IComplainsResponse & { isCurrentStop?: boolean }

export const ComplainsMessage: React.FC<Props> = ({ date, on, type, direction, stop, isCurrentStop = false }) => {
	const left = useMemo(() => getHumanDate(date), [date])
	const directionString = getDirectionString(direction)
	const onString = getOnString(on, type)

	return (
		<MessageContainerStyled>
			<ComplainsStopStyled $isCurrentStop={isCurrentStop}>{stop}</ComplainsStopStyled>
			<ComplainsDirectionStyled>{directionString}</ComplainsDirectionStyled>
			<p>{onString}</p>
			<MessageDateStyled>{left}</MessageDateStyled>
		</MessageContainerStyled>
	)
}
