import { useCallback, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import Select, { SingleValue } from 'react-select'
import { ComplainType } from 'features/Complains'
import { useComplainsContext } from 'features/Complains/model/ComplainsContext'
import { HowMuchLeft } from 'features/HowMuchLeft/HowMuchLeft'
import { AndrewLytics } from 'shared/lib'
import { IOption, StopKeys } from 'shared/store/busStop/Stops'
import { todayHolidaySelector } from 'shared/store/holidays/holidaysSlice'
import { leftSelector } from 'shared/store/timeLeft/timeLeftSlice'
import { useTimeLeftUpdater } from 'shared/store/timeLeft/useTimeLeftUpdater'
import { CardStyled, ContainerStyled } from 'shared/ui'
import { Header } from 'shared/ui/Header'
import { selectStyles } from 'shared/ui/SelectStyles'

import {
	busStopNewSelector,
	directionSelector,
	setBusStop,
	stopsOptionsSelector,
} from '../../shared/store/busStop/busStopInfoSlice'
import { useFastReplay } from './model/useFastReplay'
import { useUrlBusStop } from './model/useUrlBusStop'

export const BusStop: React.FC = () => {
	useTimeLeftUpdater()

	const { setQueryParams } = useUrlBusStop()
	const { t } = useTranslation()
	const dispatch = useDispatch()
	const stopsOptions = useSelector(stopsOptionsSelector)
	const busStopNew = useSelector(busStopNewSelector)
	const direction = useSelector(directionSelector)
	const todaysHoliday = useSelector(todayHolidaySelector)
	const left = useSelector(leftSelector)

	const { shouldShowFastReply } = useFastReplay()
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

	const handleChangeBusStop = useCallback(
		(e: SingleValue<IOption<string | null>>) => {
			if (!e?.value) return

			const busStopToChange = e.value as StopKeys

			dispatch(setBusStop(busStopToChange))

			AndrewLytics(`selectBusStop`)
		},
		[dispatch],
	)

	useEffect(() => {
		setQueryParams(busStopNew)
	}, [busStopNew, setQueryParams])

	const currentBusStop = useMemo(
		() => stopsOptions.find(stop => stop.value === busStopNew?.label),
		[stopsOptions, busStopNew],
	) // TODO remove find

	const headerText = t(`Bus stop`)

	return (
		<ContainerStyled>
			<CardStyled>
				<Header text={headerText}>
					<Select
						isSearchable={false}
						styles={selectStyles}
						options={stopsOptions}
						onChange={handleChangeBusStop}
						value={currentBusStop}
						defaultValue={stopsOptions[0]}
					/>
				</Header>

				<HowMuchLeft
					holiday={todaysHoliday}
					busStopLabel={busStopNew?.label || null}
					left={left}
					shouldShowFastReply={shouldShowFastReply}
					onComplain={handleComplain}
				/>
			</CardStyled>
		</ContainerStyled>
	)
}
