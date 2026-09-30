import { useCallback, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { AndrewLytics } from 'shared/lib'
import { busStopNewSelector, directionSelector } from 'shared/store/busStop/busStopInfoSlice'
import { currentDaySelector, scheduleSelector } from 'shared/store/schedule/scheduleSlice'
import useEverySecondUpdater from 'shared/store/timeLeft/useEverySecondUpdater'
import { InlineOptions } from 'shared/ui/InlineOptions'

import { findCandidateTrips, nowMinutesInTomsk, TripCandidate } from '../lib/matchReports'
import { ComplainType } from '../model/Complains'
import { useComplainsContext } from '../model/ComplainsContext'
import { IComplainTrip } from '../model/useComplains'
import { useTripMarks } from '../model/useCrowdReports'
import fastreplyStyles from './fastreply.module.css'
import { delayPhrase } from './StopCrowdStatus'

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

const thanksText = (type: ComplainType, trip: TripCandidate | undefined): string => {
	if (!trip) return `Спасибо! Отметка сохранена`

	if (type === ComplainType.arrived) {
		return `Спасибо! Записали: рейс ${trip.item.time} пришёл ${delayPhrase(trip.delay)}`
	}

	return `Спасибо! Предупредим тех, кто ждёт рейс ${trip.item.time}`
}

export const Fastreply: React.FC = () => {
	const [activeComplain, setActiveComplain] = useState<ComplainType | null>(null)
	const [thanks, setThanks] = useState<string | null>(null)
	const [pickedTime, setPickedTime] = useState<string | null>(null)
	const cooldownsRef = useRef<Record<string, number>>({})
	const [, forceUpdate] = useState(0)

	const busStopNew = useSelector(busStopNewSelector)
	const direction = useSelector(directionSelector)
	const schedule = useSelector(scheduleSelector)
	const dayKey = useSelector(currentDaySelector)
	const tick = useEverySecondUpdater()

	const { addComplain } = useComplainsContext()
	const marksFor = useTripMarks()

	// Trips a mark made right now can be about. Two of them — let the passenger choose. A trip
	// someone already saw arrive here is done: a new «Приехал» is about the next one
	const candidates = useMemo(
		() =>
			busStopNew
				? findCandidateTrips(
						schedule,
						direction,
						dayKey,
						busStopNew.label,
						nowMinutesInTomsk(),
						ComplainType.arrived,
				  )
						.filter(c => !marksFor(c.item, busStopNew.label)?.arrivedHere)
						.slice(0, 2)
				: [],
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[busStopNew, direction, schedule, dayKey, marksFor, tick],
	)

	const isOnCooldown = useCallback((stopLabel: string): boolean => {
		const until = cooldownsRef.current[stopLabel]
		if (!until) return false
		if (Date.now() >= until) {
			delete cooldownsRef.current[stopLabel]

			return false
		}

		return true
	}, [])

	const tripFor = (type: ComplainType): TripCandidate | undefined => {
		if (!busStopNew) return undefined
		// The trip shown in the prompt is the one being marked, whatever the button
		const shown = candidates.find(c => c.item.time === pickedTime) ?? (candidates[0] as TripCandidate | undefined)
		if (shown) return shown

		// «Не приехал» is about the trip that was due, even if it is past the «Приехал» window
		return type === ComplainType.not_arrive
			? findCandidateTrips(schedule, direction, dayKey, busStopNew.label, nowMinutesInTomsk(), type).find(
					c => !marksFor(c.item, busStopNew.label)?.arrivedHere,
			  )
			: undefined
	}

	const handleFastReplyClick = (key: ComplainType | null): void => {
		if (!key || !busStopNew) return
		if (isOnCooldown(busStopNew.label)) return

		const candidate = tripFor(key)
		const trip: IComplainTrip | undefined = candidate && {
			scheduledTime: candidate.item.time,
			tripIndex: candidate.item.tripIndex,
			dayKey: candidate.item.dayKey,
		}

		setActiveComplain(key)
		setThanks(thanksText(key, candidate))

		cooldownsRef.current[busStopNew.label] = Date.now() + COOLDOWN_MS
		setTimeout(() => {
			forceUpdate(n => n + 1)
		}, COOLDOWN_MS)

		addComplain({
			stop: busStopNew.label,
			direction,
			date: new Date().toISOString(),
			type: key,
			trip,
		})

		AndrewLytics(`fastReply`)

		setTimeout(() => {
			setActiveComplain(null)
			setThanks(null)
		}, 6000)
	}

	if (!busStopNew) return null

	const onCooldown = isOnCooldown(busStopNew.label)
	const current = candidates.find(c => c.item.time === pickedTime) ?? candidates[0]

	return (
		<ComplainOptionContainerStyled>
			<div className={fastreplyStyles.prompt}>
				{candidates.length === 0 && <span>Отметьте автобус на этой остановке</span>}
				{candidates.length === 1 && (
					<span>
						Отметьте рейс <b>{candidates[0].item.time}</b>
					</span>
				)}
				{candidates.length > 1 && (
					<>
						<span>Какой рейс?</span>
						{candidates.map(c => (
							<button
								key={c.item.time}
								type="button"
								className={`${fastreplyStyles.tripChip} ${
									c === current ? fastreplyStyles.tripChipActive : ``
								}`}
								onClick={(): void => setPickedTime(c.item.time)}
							>
								{c.item.time}
							</button>
						))}
					</>
				)}
			</div>

			<InlineOptions<ComplainType>
				list={ComplainsOptions}
				onClick={handleFastReplyClick}
				activeId={activeComplain}
				disabled={onCooldown}
			/>

			{thanks && <p className={fastreplyStyles.thanks}>{thanks}</p>}
		</ComplainOptionContainerStyled>
	)
}
