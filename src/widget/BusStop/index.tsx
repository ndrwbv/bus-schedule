import { Card, Container } from 'shared/ui'
import { Header } from 'shared/ui/Header'
import Select from 'react-select'
import { useDispatch, useSelector } from 'react-redux'
import {
	busStopSelector,
	directionSelector,
	setBusStop,
	stopsOptionsSelector,
} from 'shared/store/busStop/busStopInfoSlice'
import HowMuchLeft from 'features/HowMuchLeft/HowMuchLeft'
import { AndrewLytics } from 'shared/lib'
import { useCallback, useMemo } from 'react'
import { useScheduleContext } from 'widget/Schedule/model/ScheduleContext'
import { useComplainsContext } from 'features/Complains/model/ComplainsContext'
import { useTranslation } from 'react-i18next'
import { ComplainType } from 'features/Complains'
import { StopKeys } from 'widget/Schedule/types/Stops'
import { selectStyles } from 'shared/ui/SelectStyles'
import { useUrlBusStop } from './model/useUrlBusStop'
import { todayHolidaySelector } from 'shared/store/holidays/holidaysSlice'

export const BusStop = () => {
	const { setQueryParams } = useUrlBusStop()
	const { t } = useTranslation()
	const dispatch = useDispatch()
	const stopsOptions = useSelector(stopsOptionsSelector)
	const busStop = useSelector(busStopSelector)
	const direction = useSelector(directionSelector)
	const todaysHoliday = useSelector(todayHolidaySelector)

	const { left, shouldShowFastReply } = useScheduleContext()

	const { addComplain } = useComplainsContext()

	const handleComplain = (type: ComplainType) => {
		if (!busStop || left.minutes === null) return

		const date = new Date().toISOString()

		addComplain({
			stop: busStop,
			direction: direction,
			date: date,
			type: type,
			on: 0,
		})

		AndrewLytics('fastReply')
	}

	const handleChangeBusStop = useCallback((e: any) => {
		const busStopToChange = e?.value as StopKeys

		dispatch(setBusStop(busStopToChange))
		setQueryParams(busStopToChange)

		AndrewLytics('selectBusStop')
	}, [])

	const currentBusStop = useMemo(() => stopsOptions.find(stop => stop.value === busStop), [stopsOptions, busStop])

	return (
		<Container>
			<Card>
				<Header text={t('Bus stop')}>
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
					busStop={busStop}
					left={left}
					shouldShowFastReply={shouldShowFastReply}
					onComplain={handleComplain}
				/>
			</Card>
		</Container>
	)
}
