import React, { useMemo } from 'react'
import { STOPS } from 'shared/store/busStop/const/stops'

import { getDirectionString, getHumanDate, getTypeString } from '../helpers'
import { ComplainType } from '../model/Complains'
import { IComplainsResponse } from '../model/useComplains'
import { ComplainsDirectionStyled, ComplainsStopStyled, MessageContainerStyled, MessageDateStyled } from './styled'

type Props = IComplainsResponse & { isCurrentStop?: boolean }

function resolveStopLabel(stopId: string, direction: string): string | null {
	const stop = STOPS.find(s => s.id === stopId && s.direction === direction)

	return stop?.label ?? null
}

export const ComplainsMessage: React.FC<Props> = ({ date, type, direction, stop_id, isCurrentStop = false }) => {
	const label = useMemo(() => resolveStopLabel(stop_id, direction), [stop_id, direction])
	const left = useMemo(() => getHumanDate(date), [date])
	const directionString = getDirectionString(direction)
	const typeString = getTypeString(type as ComplainType)

	if (!label) return null

	return (
		<MessageContainerStyled>
			<ComplainsStopStyled $isCurrentStop={isCurrentStop}>{label}</ComplainsStopStyled>
			<ComplainsDirectionStyled>{directionString}</ComplainsDirectionStyled>
			<p>{typeString}</p>
			<MessageDateStyled>{left}</MessageDateStyled>
		</MessageContainerStyled>
	)
}
