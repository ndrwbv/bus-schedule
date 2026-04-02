import { useCallback, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { AndrewLytics } from 'shared/lib'
import { busStopNewSelector, directionSelector } from 'shared/store/busStop/busStopInfoSlice'
import { InlineOptions } from 'shared/ui/InlineOptions'

import { ComplainType } from '../model/Complains'
import { useComplainsContext } from '../model/ComplainsContext'
import fastreplyStyles from './fastreply.module.css'

const COOLDOWN_MS = 2 * 60 * 1000 // 2 minutes

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

export const ComplainOptionContainerStyled: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<div className={fastreplyStyles.complainOptionContainer}>{children}</div>
)

export const Fastreply: React.FC = () => {
	const [activeComplain, setActiveComplain] = useState<ComplainType | null>(null)
	const cooldownsRef = useRef<Record<string, number>>({})
	const [, forceUpdate] = useState(0)

	const busStopNew = useSelector(busStopNewSelector)
	const direction = useSelector(directionSelector)

	const { addComplain } = useComplainsContext()

	const isOnCooldown = useCallback((stopLabel: string): boolean => {
		const until = cooldownsRef.current[stopLabel]
		if (!until) return false
		if (Date.now() >= until) {
			delete cooldownsRef.current[stopLabel]

			return false
		}

		return true
	}, [])

	const handleFastReplyClick = (key: ComplainType | null): void => {
		if (!key || !busStopNew) return
		if (isOnCooldown(busStopNew.label)) return

		setActiveComplain(key)

		cooldownsRef.current[busStopNew.label] = Date.now() + COOLDOWN_MS
		setTimeout(() => {
			forceUpdate(n => n + 1)
		}, COOLDOWN_MS)

		addComplain({
			stop_id: busStopNew.id,
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

	const onCooldown = isOnCooldown(busStopNew.label)

	return (
		<ComplainOptionContainerStyled>
			<InlineOptions<ComplainType>
				list={ComplainsOptions}
				onClick={handleFastReplyClick}
				activeId={activeComplain}
				disabled={onCooldown}
			/>
		</ComplainOptionContainerStyled>
	)
}
