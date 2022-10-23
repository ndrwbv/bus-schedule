import React, { useMemo } from 'react'
import { getDirectionString, getHumanDate, getOnString } from '../helpers'
import { ComplainsDirection, ComplainsStop, MessageContainer, MessageDate } from './styled'
import { IComplainsResponse } from '../model/useComplains'

type Props = IComplainsResponse & { isCurrentStop?: boolean }

const ComplainsMessage: React.FC<Props> = ({ id, date, on, type, direction, stop, isCurrentStop = false }) => {
	const left = useMemo(() => getHumanDate(date), [date])
	const directionString = getDirectionString(direction)
	const onString = getOnString(on, type)

	return (
		<MessageContainer>
			<ComplainsStop isCurrentStop={isCurrentStop}>{stop}</ComplainsStop>
			<ComplainsDirection>{directionString}</ComplainsDirection>
			<p>{onString}</p>
			<MessageDate>{left}</MessageDate>
		</MessageContainer>
	)
}

export default ComplainsMessage
