import { useMemo, useState } from 'react'
import Select from 'react-select'

import { Header } from 'shared/ui/Header/Header'
import { SelectBusStopText } from '../../entities/SelectBusStopText'
import { IOption } from 'widget/Schedule/types/Stops'
import { useTranslation } from 'react-i18next'
import { AndrewLytics } from 'shared/lib'
import { Card, Container } from 'shared/ui'
import { useSelector } from 'react-redux'
import { nextDaySelector, scheduleSelector } from 'widget/Schedule/model/scheduleSlice'
import { busStopSelector, directionSelector } from 'widget/Schedule/model/busStopInfoSlice'
import { selectStyles } from 'shared/ui/SelectStyles'
import { TimeStamp } from 'shared/ui/TimeStamp'
import { OtherTime } from 'shared/ui/OtherTime'

export const OtherTimeBusses = () => {
	const busStop = useSelector(busStopSelector)
	const nextDay = useSelector(nextDaySelector)
	const SCHEDULE = useSelector(scheduleSelector)
	const direction = useSelector(directionSelector)

	const { t } = useTranslation()

	const DaysOptions = [
		{
			label: t('Tomorrow'),
			value: nextDay,
		},
		{
			label: t('Weekday'),
			value: 1,
		},
		{
			label: t('Saturday'),
			value: 6,
		},
		{
			label: t('Sunday'),
			value: 0,
		},
	]

	const [busOption, setBusOption] = useState<IOption<number>>(DaysOptions[0])

	const handleChange = (e: IOption<number> | null) => {
		if (!e) return
		AndrewLytics('otherSchedule')
		setBusOption(e)
	}

	const renderOtherTimeContent = useMemo(() => {
		return busStop ? (
			SCHEDULE[direction][busOption.value][busStop]?.map((d, index) => (
				<TimeStamp key={`${d}-${index}`}>{d}</TimeStamp>
			))
		) : (
			<SelectBusStopText />
		)
	}, [busStop, SCHEDULE, direction, busOption])

	return (
		<Container>
			<Card>
				<Header text={t('Buses for')}>
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
