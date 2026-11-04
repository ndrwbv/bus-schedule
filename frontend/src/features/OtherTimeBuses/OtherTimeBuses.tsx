/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import Select from 'react-select'
import { TripTimeRow } from 'features/TripStops'
import { AndrewLytics } from 'shared/lib'
import { busStopSelector, userDirectionSelector } from 'shared/store/busStop/busStopInfoSlice'
import { getScheduleTimes } from 'shared/store/busStop/const/stops'
import { IOption } from 'shared/store/busStop/Stops'
import { holidaysSelector } from 'shared/store/holidays/holidaysSlice'
import { scheduleSelector, serviceDateSelector } from 'shared/store/schedule/scheduleSlice'
import { addDays, nextDateForDay, nextWeekdayDate, scheduleDay } from 'shared/store/schedule/serviceDate'
import { CardStyled, ContainerStyled } from 'shared/ui'
import { Header } from 'shared/ui/Header/Header'
import { OtherTimeStyled } from 'shared/ui/OtherTime'
import { selectStyles } from 'shared/ui/SelectStyles'

import { SelectBusStopText } from '../../entities/SelectBusStopText'

export const OtherTimeBusses: React.FC = () => {
	const busStop = useSelector(busStopSelector)
	const today = useSelector(serviceDateSelector)
	const holidays = useSelector(holidaysSelector)
	const SCHEDULE = useSelector(scheduleSelector)
	const userDirection = useSelector(userDirectionSelector)

	const { t } = useTranslation()

	const dates: Record<string, string> = {
		tomorrow: addDays(today, 1),
		weekday: nextWeekdayDate(today, holidays),
		saturday: nextDateForDay(today, 6),
		sunday: nextDateForDay(today, 0),
	}
	const DaysOptions: IOption<string>[] = [
		{ label: t(`Tomorrow`), value: `tomorrow` },
		{ label: t(`Weekday`), value: `weekday` },
		{ label: t(`Saturday`), value: `saturday` },
		{ label: t(`Sunday`), value: `sunday` },
	]
	const [selectedDay, setSelectedDay] = useState(`tomorrow`)
	const busOption = DaysOptions.find(option => option.value === selectedDay) ?? DaysOptions[0]
	const serviceDate = dates[busOption.value]
	const dayKey = scheduleDay(serviceDate, holidays)
	const handleChange = (e: IOption<string> | null): void => {
		if (!e) return
		AndrewLytics(`otherSchedule`)
		setSelectedDay(e.value)
	}

	const renderOtherTimeContent = useMemo(() => {
		if (!busStop) return <SelectBusStopText />
		const tagged = getScheduleTimes(SCHEDULE, userDirection, dayKey, busStop, serviceDate)
		if (tagged.length === 0) return <span>В этот день рейсов нет</span>

		return tagged.map(item => {
			const key = `${item.direction}-${item.tripId ?? item.tripIndex}-${item.visitIndex ?? 0}`

			return <TripTimeRow key={key} item={item} />
		})
	}, [busStop, SCHEDULE, userDirection, dayKey, serviceDate])

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
