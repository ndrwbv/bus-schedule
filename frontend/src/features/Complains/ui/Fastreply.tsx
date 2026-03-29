import { useState } from 'react'
import { useSelector } from 'react-redux'
import { AndrewLytics } from 'shared/lib'
import { busStopNewSelector, directionSelector } from 'shared/store/busStop/busStopInfoSlice'
import { InlineOptions } from 'shared/ui/InlineOptions'
import styled from 'styled-components'

import { ComplainType } from '../model/Complains'
import { useComplainsContext } from '../model/ComplainsContext'

const ComplainsOptions = [
	{
		value: ComplainType.arrived,
		label: `Приехал`,
	},
	{
		value: ComplainType.not_arrive,
		label: `Не приехал`,
	},
	{
		value: ComplainType.passed_by,
		label: `Проехал мимо`,
	},
]

export const ComplainOptionContainerStyled = styled.div`
	margin-top: 12px;
`

export const Fastreply: React.FC = () => {
	const [activeComplain, setActiveComplain] = useState<ComplainType | null>(null)

	const busStopNew = useSelector(busStopNewSelector)
	const direction = useSelector(directionSelector)

	const { addComplain } = useComplainsContext()

	const handleFastReplyClick = (key: ComplainType | null): void => {
		if (!key || !busStopNew) return

		setActiveComplain(key)

		addComplain({
			stop: busStopNew.label,
			direction,
			date: new Date().toISOString(),
			type: key,
		})

		AndrewLytics(`fastReply`)

		setTimeout(() => {
			setActiveComplain(null)
		}, 3000)
	}

	if (!busStopNew) return null

	return (
		<ComplainOptionContainerStyled>
			<InlineOptions<ComplainType>
				list={ComplainsOptions}
				onClick={handleFastReplyClick}
				activeId={activeComplain}
			/>
		</ComplainOptionContainerStyled>
	)
}
