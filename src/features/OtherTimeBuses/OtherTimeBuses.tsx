/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import Select from 'react-select'
import { AndrewLytics } from 'shared/lib'
import { busStopSelector, directionSelector } from 'shared/store/busStop/busStopInfoSlice'
import { IOption } from 'shared/store/busStop/Stops'
import { nextDaySelector, scheduleSelector } from 'shared/store/schedule/scheduleSlice'
import { Card, Container } from 'shared/ui'
import { Header } from 'shared/ui/Header/Header'
import { OtherTime } from 'shared/ui/OtherTime'
import { selectStyles } from 'shared/ui/SelectStyles'
import { TimeStamp } from 'shared/ui/TimeStamp'

import { SelectBusStopText } from '../../entities/SelectBusStopText'

export const OtherTimeBusses: React.FC = () => {
	const busStop = useSelector(busStopSelector)
	const nextDay = useSelector(nextDaySelector)
	const SCHEDULE = useSelector(scheduleSelector)
	const direction = useSelector(directionSelector)

	const { t } = useTranslation()

	const DaysOptions = [
		{
			label: t(`Tomorrow`),
			value: nextDay,
		},
		{
			label: t(`Weekday`),
			value: 1,
		},
		{
			label: t(`Saturday`),
			value: 6,
		},
		{
			label: t(`Sunday`),
			value: 0,
		},
	]

	const [busOption, setBusOption] = useState<IOption<number>>(DaysOptions[0])

	const handleChange = (e: IOption<number> | null): void => {
		if (!e) return
		AndrewLytics(`otherSchedule`)
		setBusOption(e)
	}

	const renderOtherTimeContent = useMemo(() => {
		return busStop ? (
			SCHEDULE[direction][busOption.value][busStop].map(timeKeys => (
				<TimeStamp key={`${timeKeys}`}>{timeKeys}</TimeStamp>
			))
		) : (
			<SelectBusStopText />
		)
	}, [busStop, SCHEDULE, direction, busOption])

	return (
		<Container>
			<Card>
				<Header text={t(`Buses for`)}>
					<Select
						isSearchable={false}
						styles={selectStyles}
						options={DaysOptions}
						onChange={handleChange}
						value={busOption}
						defaultValue={DaysOptions[0]}
					/>
				</Header>

				<OtherTime>{renderOtherTimeContent}</OtherTime>
			</Card>
		</Container>
	)
}
