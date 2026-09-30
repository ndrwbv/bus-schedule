import { useCallback, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { Fastreply, StopCrowdStatus } from 'features/Complains'
import { HowMuchLeft } from 'features/HowMuchLeft/HowMuchLeft'
import { openTrip } from 'features/TripStops'
import { AndrewLytics } from 'shared/lib'
import { StopKeys, TaggedTime, UserDirection } from 'shared/store/busStop/Stops'
import { todayHolidaySelector } from 'shared/store/holidays/holidaysSlice'
import { closestTimeArraySelector, leftSelector } from 'shared/store/timeLeft/timeLeftSlice'
import { useTimeLeftUpdater } from 'shared/store/timeLeft/useTimeLeftUpdater'
import { CardStyled, ContainerStyled } from 'shared/ui'
import { Header } from 'shared/ui/Header'
import { InlineOptions } from 'shared/ui/InlineOptions'

import {
	availableUserDirectionsSelector,
	busStopNewSelector,
	setBusStop,
	setUserDirection,
	stopsOptionsSelector,
	userDirectionSelector,
} from '../../shared/store/busStop/busStopInfoSlice'
import { useUrlBusStop } from './model/useUrlBusStop'
import styles from './ui/busStop.module.css'
import { StopPickerModal } from './ui/StopPickerModal'

const USER_DIRECTION_LABELS: Record<UserDirection, string> = {
	[UserDirection.fromCity]: `Из города`,
	[UserDirection.toCity]: `В город`,
}

export const BusStop: React.FC = () => {
	useTimeLeftUpdater()

	const { setQueryParams } = useUrlBusStop()
	const { t } = useTranslation()
	const dispatch = useDispatch()
	const stopsOptions = useSelector(stopsOptionsSelector)
	const busStopNew = useSelector(busStopNewSelector)
	const todaysHoliday = useSelector(todayHolidaySelector)
	const left = useSelector(leftSelector)
	const userDirection = useSelector(userDirectionSelector)
	const availableUserDirections = useSelector(availableUserDirectionsSelector)
	const nextBus = useSelector(closestTimeArraySelector)[0] as TaggedTime | undefined

	const handleChangeBusStop = useCallback(
		(busStopToChange: StopKeys) => {
			dispatch(setBusStop(busStopToChange))
			AndrewLytics(`selectBusStop`)
		},
		[dispatch],
	)

	const handleChangeUserDirection = useCallback(
		(value: UserDirection | null) => {
			if (value) {
				dispatch(setUserDirection(value))
				AndrewLytics(`changeDirection`)
			}
		},
		[dispatch],
	)

	const handleNextBusClick = useCallback(() => {
		if (!nextBus) return
		dispatch(openTrip({ direction: nextBus.direction, dayKey: nextBus.dayKey, tripIndex: nextBus.tripIndex }))
		AndrewLytics(`trip:open-next`)
	}, [dispatch, nextBus])

	useEffect(() => {
		setQueryParams(busStopNew)
	}, [busStopNew, setQueryParams])

	const directionOptions = useMemo(
		() =>
			availableUserDirections.map(d => ({
				label: USER_DIRECTION_LABELS[d],
				value: d,
			})),
		[availableUserDirections],
	)

	const headerText = t(`Bus stop`)

	return (
		<ContainerStyled>
			<CardStyled>
				<Header text={headerText}>
					<StopPickerModal
						options={stopsOptions}
						value={busStopNew?.label ?? null}
						onChange={handleChangeBusStop}
					/>
				</Header>

				{availableUserDirections.length > 1 && (
					<div style={{ marginBottom: 14 }}>
						<InlineOptions<UserDirection>
							list={directionOptions}
							activeId={userDirection}
							onClick={handleChangeUserDirection}
						/>
					</div>
				)}

				{nextBus ? (
					<button className={styles.nextBusButton} type="button" onClick={handleNextBusClick}>
						<HowMuchLeft holiday={todaysHoliday} busStopLabel={busStopNew?.label || null} left={left} />
						<span className={styles.nextBusHint}>Все остановки этого рейса ›</span>
					</button>
				) : (
					<HowMuchLeft holiday={todaysHoliday} busStopLabel={busStopNew?.label || null} left={left} />
				)}

				<StopCrowdStatus />

				<Fastreply />
			</CardStyled>
		</ContainerStyled>
	)
}
