import { useState } from 'react'
import { useSelector } from 'react-redux'
import { AndrewLytics } from 'shared/lib'
import { busStopNewSelector, directionSelector } from 'shared/store/busStop/busStopInfoSlice'
import { StopKeys } from 'shared/store/busStop/Stops'
import { InlineOptions } from 'shared/ui/InlineOptions'

import { ComplainType } from '../model/Complains'
import { useComplainsContext } from '../model/ComplainsContext'
import fastreplyStyles from './fastreply.module.css'

const COOLDOWN_MS = 2 * 60 * 1000 // 2 minutes

type ReplyState = { status: 'sent'; type: ComplainType } | { status: 'sending' | 'rateLimited' | 'failed' }

function getReplyMessage(reply?: ReplyState): string {
	switch (reply?.status) {
		case `sending`:
			return `Отправляем…`
		case `sent`:
			return reply.type === ComplainType.arrived ? `Отметка отправлена` : `Жалоба отправлена`
		case `rateLimited`:
			return `Вы уже отправили отметку для этой остановки. Попробуйте чуть позже.`
		case `failed`:
			return `Не удалось отправить. Попробуйте ещё раз.`
		default:
			return ``
	}
}

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
	const [replies, setReplies] = useState<Partial<Record<StopKeys, ReplyState>>>({})

	const busStopNew = useSelector(busStopNewSelector)
	const direction = useSelector(directionSelector)

	const { addComplain } = useComplainsContext()

	if (!busStopNew) return null
	const stop = busStopNew.label
	const reply = replies[stop]
	const disabled = reply?.status === `sending` || reply?.status === `sent`

	const handleFastReplyClick = async (type: ComplainType | null): Promise<void> => {
		if (!type || disabled) return

		setReplies(prev => ({ ...prev, [stop]: { status: `sending` } }))
		const status = await addComplain({ stop, direction, type })
		setReplies(prev => ({ ...prev, [stop]: status === `sent` ? { status, type } : { status } }))

		if (status === `sent`) {
			setTimeout(() => setReplies(prev => ({ ...prev, [stop]: undefined })), COOLDOWN_MS)
		}

		AndrewLytics(`addComplainMethod`)
		AndrewLytics(`fastReply`)
	}

	return (
		<ComplainOptionContainerStyled>
			<InlineOptions<ComplainType>
				list={ComplainsOptions}
				onClick={type => {
					void handleFastReplyClick(type)
				}}
				activeId={reply?.status === `sent` ? reply.type : null}
				disabled={disabled}
			/>
			<div className={fastreplyStyles.submissionStatus} role="status">
				{getReplyMessage(reply)}
			</div>
		</ComplainOptionContainerStyled>
	)
}
