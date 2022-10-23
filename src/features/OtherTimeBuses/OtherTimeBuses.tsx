import { useMemo, useState } from 'react'
import Select from 'react-select'

import { Header } from 'shared/ui/Header/Header'
import { OtherTime, selectStyles, TimeStamp } from 'components/Schedule/styled'
import { SelectBusStopText } from '../../entities/SelectBusStopText'
import { useScheduleContext } from 'context/ScheduleContext'
import { IOption } from 'interfaces/Stops'
import { useTranslation } from 'react-i18next'
import { AndrewLytics } from 'shared/lib'
import { Card, Container } from 'shared/ui'

export const OtherTimeBusses = () => {
	const { nextDay, busStop, SCHEDULE, direction } = useScheduleContext()
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
