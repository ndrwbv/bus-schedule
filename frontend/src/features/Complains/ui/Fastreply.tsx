import { useCallback, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { AndrewLytics } from 'shared/lib'
import { busStopNewSelector, directionSelector } from 'shared/store/busStop/busStopInfoSlice'
import { currentDaySelector, scheduleSelector } from 'shared/store/schedule/scheduleSlice'
import { InlineOptions } from 'shared/ui/InlineOptions'

import { findCandidateTrips, nowMinutesInTomsk, TripCandidate } from '../lib/matchReports'
import { ComplainType } from '../model/Complains'
import { useComplainsContext } from '../model/ComplainsContext'
import { useTripMarks } from '../model/useCrowdReports'
import { useWaitCheck } from '../model/useWaitCheck'
import fastreplyStyles from './fastreply.module.css'
import { WaitCheckModal } from './WaitCheckModal'

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

/**
 * Three buttons for whoever sees the bus. The trip is picked silently; «Не приехал» opens the same
 * modal as the automatic check (`useWaitCheck`), because only the passenger knows whether the bus is
 * late or left before they came.
 */
export const Fastreply: React.FC = () => {
	const [activeComplain, setActiveComplain] = useState<ComplainType | null>(null)
	const [thanks, setThanks] = useState(false)
	const cooldownsRef = useRef<Record<string, number>>({})
	const [, forceUpdate] = useState(0)

	const busStopNew = useSelector(busStopNewSelector)
	const direction = useSelector(directionSelector)
	const schedule = useSelector(scheduleSelector)
	const dayKey = useSelector(currentDaySelector)

	const { addComplain } = useComplainsContext()
	const marksFor = useTripMarks()
	const check = useWaitCheck()

	const isOnCooldown = useCallback((stopLabel: string): boolean => {
		const until = cooldownsRef.current[stopLabel]
		if (!until) return false
		if (Date.now() >= until) {
			delete cooldownsRef.current[stopLabel]

			return false
		}

		return true
	}, [])

	// A trip someone already saw arrive here is done: a new mark is about the next one
	const tripFor = (type: ComplainType): TripCandidate | undefined =>
		busStopNew
			? findCandidateTrips(schedule, direction, dayKey, busStopNew.label, nowMinutesInTomsk(), type).find(
					c => !marksFor(c.item, busStopNew.label)?.arrivedHere,
			  )
			: undefined

	const handleFastReplyClick = (key: ComplainType | null): void => {
		if (!key || !busStopNew) return
		if (isOnCooldown(busStopNew.label)) return

		const candidate = tripFor(key)
		AndrewLytics(`fastReply`)

		if (key === ComplainType.not_arrive && candidate) {
			check.askOnTime(candidate.item)

			return
		}

		setActiveComplain(key)
		setThanks(true)

		cooldownsRef.current[busStopNew.label] = Date.now() + COOLDOWN_MS
		setTimeout(() => {
			forceUpdate(n => n + 1)
		}, COOLDOWN_MS)

		void addComplain({
			stop: busStopNew.label,
			direction,
			date: new Date().toISOString(),
			type: key,
			trip: candidate && {
				scheduledTime: candidate.item.time,
				tripIndex: candidate.item.tripIndex,
				dayKey: candidate.item.dayKey,
			},
		})

		setTimeout(() => {
			setActiveComplain(null)
			setThanks(false)
		}, 3000)
	}

	if (!busStopNew) return null

	return (
		<ComplainOptionContainerStyled>
			<InlineOptions<ComplainType>
				list={ComplainsOptions}
				onClick={handleFastReplyClick}
				activeId={activeComplain}
				disabled={isOnCooldown(busStopNew.label)}
			/>

			{thanks && <p className={fastreplyStyles.thanks}>Спасибо!</p>}

			<WaitCheckModal check={check} />
		</ComplainOptionContainerStyled>
	)
}
