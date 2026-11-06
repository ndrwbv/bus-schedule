import { useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { Fastreply } from 'features/Complains'
import { HowMuchLeft } from 'features/HowMuchLeft/HowMuchLeft'
import { openTrip } from 'features/TripStops'
import { AndrewLytics } from 'shared/lib'
import {
	availableUserDirectionsSelector,
	busStopNewSelector,
	setUserDirection,
	userDirectionSelector,
} from 'shared/store/busStop/busStopInfoSlice'
import { TaggedTime } from 'shared/store/busStop/Stops'
import { todayHolidaySelector } from 'shared/store/holidays/holidaysSlice'
import { closestTimeArraySelector, leftSelector } from 'shared/store/timeLeft/timeLeftSlice'
import { useTimeLeftUpdater } from 'shared/store/timeLeft/useTimeLeftUpdater'
import { CardStyled, ContainerStyled, CustomButtonStyled } from 'shared/ui'
import { Header } from 'shared/ui/Header'

import { useUrlBusStop } from './model/useUrlBusStop'
import { StopPickerModal } from './ui/StopPickerModal'

export const BusStop: React.FC = () => {
	useTimeLeftUpdater()

	const { setQueryParams } = useUrlBusStop()
	const { t } = useTranslation()
	const dispatch = useDispatch()
	const busStopNew = useSelector(busStopNewSelector)
	const todaysHoliday = useSelector(todayHolidaySelector)
	const left = useSelector(leftSelector)
	const userDirection = useSelector(userDirectionSelector)
	const availableUserDirections = useSelector(availableUserDirectionsSelector)
	const nextBus = useSelector(closestTimeArraySelector)[0] as TaggedTime | undefined

	useEffect(() => {
		if (availableUserDirections.length && !availableUserDirections.includes(userDirection))
			dispatch(setUserDirection(availableUserDirections[0]))
	}, [availableUserDirections, userDirection, dispatch])

	const handleNextBusClick = useCallback(() => {
		if (!nextBus) return
		dispatch(
			openTrip({
				direction: nextBus.direction,
				dayKey: nextBus.dayKey,
				tripIndex: nextBus.tripIndex,
				tripId: nextBus.tripId,
				visitIndex: nextBus.visitIndex,
				serviceDate: nextBus.serviceDate,
			}),
		)
		AndrewLytics(`trip:open-next`)
	}, [dispatch, nextBus])

	useEffect(() => {
		setQueryParams(busStopNew)
	}, [busStopNew, setQueryParams])

	return (
		<>
			<ContainerStyled>
				<CardStyled>
					<Header text={t(`Bus stop`)}>
						<StopPickerModal />
					</Header>
					<HowMuchLeft holiday={todaysHoliday} busStopLabel={busStopNew?.label || null} left={left} />
					<Fastreply />
				</CardStyled>
			</ContainerStyled>
			{nextBus && busStopNew && (
				<ContainerStyled>
					<CardStyled>
						<CustomButtonStyled $status="link" onClick={handleNextBusClick}>
							Все остановки этого рейса
						</CustomButtonStyled>
					</CardStyled>
				</ContainerStyled>
			)}
		</>
	)
}
