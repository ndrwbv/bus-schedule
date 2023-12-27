import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { AndrewLytics } from 'shared/lib'
import { busStopNewSelector, directionSelector } from 'shared/store/busStop/busStopInfoSlice'
import { leftSelector } from 'shared/store/timeLeft/timeLeftSlice'
import { InlineOptions } from 'shared/ui/InlineOptions'
import styled from 'styled-components'

import { ComplainType } from '../model/Complains'
import { useComplainsContext } from '../model/ComplainsContext'
import { useFastReplay } from '../model/useFastReplay'

const COMPLAIN_DISAPPEAR_MS = 200000
const ComplainsOptions = [
	{
		value: ComplainType.earlier,
		label: `Приехал раньше`,
	},
	{
		value: ComplainType.later,
		label: `Приехал позже`,
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
	const [isComplainClicked, setIsComplainClicked] = useState(false)
	const [activeComplain, setActiveComplain] = useState<ComplainType | null>(null)
	const { shouldShowFastReply } = useFastReplay()

	const busStopNew = useSelector(busStopNewSelector)
	const direction = useSelector(directionSelector)
	const left = useSelector(leftSelector)

	const { addComplain } = useComplainsContext()

	const handleComplain = (type: ComplainType): void => {
		if (!busStopNew || left.minutes === null) return

		const date = new Date().toISOString()

		addComplain({
			stop: busStopNew.label,
			direction,
			date,
			type,
			on: 0,
		})

		AndrewLytics(`fastReply`)
	}

	useEffect(() => {
		if (isComplainClicked) {
			setTimeout(() => {
				setIsComplainClicked(false)
				setActiveComplain(null)
			}, COMPLAIN_DISAPPEAR_MS)
		}
	}, [isComplainClicked])

	const handleFastReplyClick = (key: ComplainType | null): void => {
		if (isComplainClicked || !key) return

		setActiveComplain(key)
		handleComplain(key)
		setIsComplainClicked(true)
	}

	if (!shouldShowFastReply) return null

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
