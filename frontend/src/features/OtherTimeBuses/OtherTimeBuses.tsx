/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import Select from 'react-select'
import { AndrewLytics } from 'shared/lib'
import { busStopSelector, userDirectionSelector } from 'shared/store/busStop/busStopInfoSlice'
import { getScheduleTimes } from 'shared/store/busStop/const/stops'
import { IOption, TaggedTime } from 'shared/store/busStop/Stops'
import { nextDaySelector, scheduleSelector } from 'shared/store/schedule/scheduleSlice'
import { CardStyled, ContainerStyled } from 'shared/ui'
import { Header } from 'shared/ui/Header/Header'
import { OtherTimeStyled } from 'shared/ui/OtherTime'
import { selectStyles } from 'shared/ui/SelectStyles'
import { TimeStampStyled } from 'shared/ui/TimeStamp'

import { SelectBusStopText } from '../../entities/SelectBusStopText'

const VIA_LABELS: Record<string, string> = {
	park: `через парк`,
	lb: `через ЛБ`,
}

const TaggedTimeStamp: React.FC<{ item: TaggedTime }> = ({ item }) => (
	<TimeStampStyled>
		{item.time}
		{item.via && <span style={{ color: `#a5a5a5`, fontSize: 13, marginLeft: 6 }}>{VIA_LABELS[item.via]}</span>}
	</TimeStampStyled>
)

export const OtherTimeBusses: React.FC = () => {
	const busStop = useSelector(busStopSelector)
	const nextDay = useSelector(nextDaySelector)
	const SCHEDULE = useSelector(scheduleSelector)
	const userDirection = useSelector(userDirectionSelector)

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
		if (!busStop) return <SelectBusStopText />
		const tagged = getScheduleTimes(SCHEDULE, userDirection, busOption.value, busStop)
		if (tagged.length === 0) return <SelectBusStopText />

		return tagged.map(item => {
			const via = item.via ?? `d`
			const key = `${item.time}-${via}`

			return <TaggedTimeStamp key={key} item={item} />
		})
	}, [busStop, SCHEDULE, userDirection, busOption])

	return (
		<ContainerStyled>
			<CardStyled>
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

				<OtherTimeStyled>{renderOtherTimeContent}</OtherTimeStyled>
			</CardStyled>
		</ContainerStyled>
	)
}
