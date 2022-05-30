import { calculateHowMuchIsLeft } from 'helpers/schedule'
import { Directions } from 'interfaces/Stops'
import React, { useMemo } from 'react'
import { ComplainsDirection, ComplainsStop, MessageContainer, MessageDate } from './styled'
import { ComplainType, IComplainsResponse } from './useComplains'

const getMinutesString = (amount: number, secondWord = 'назад') => {
	if (amount === 0) return ' сейчас'
	if (amount === 1) return ` минуту ${secondWord}`
	if ([2, 3, 4].includes(amount)) return ` минуты ${secondWord}`

	return ` минут ${secondWord}`
}

const getDirectionString = (direction: Directions) => {
	return direction === 'in' ? 'в парк' : 'из парка'
}

const getTypeString = (type: ComplainType) => {
	switch (type) {
		case 'earlier':
			return 'раньше'
		case 'later':
			return 'позже'
		default:
			return ''
	}
}

const getOnString = (on: number, type: ComplainType) => {
	return `${getTypeString(type)} на ${on}${getMinutesString(on, '')}`
}

type Props = IComplainsResponse & { isCurrentStop?: boolean }

const ComplainsMessage: React.FC<Props> = ({ id, date, on, type, direction, stop, isCurrentStop = false }) => {
	const left = useMemo(() => {
		const time = calculateHowMuchIsLeft(date)
		if (!time || time.hours === null || time.hours >= 1) return 'больше часа назад'

		if (time.minutes === null) return

		return `${time.minutes === 0 ? '' : time.minutes}${getMinutesString(time.minutes)}`
	}, [date])

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
