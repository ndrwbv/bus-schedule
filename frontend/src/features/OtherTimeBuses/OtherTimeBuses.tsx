/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import Select from 'react-select'
import { TripTimeRow } from 'features/TripStops'
import { AndrewLytics } from 'shared/lib'
import { busStopSelector, userDirectionSelector } from 'shared/store/busStop/busStopInfoSlice'
import { getScheduleTimes, getUserDirectionsForLabel } from 'shared/store/busStop/const/stops'
import { IOption, UserDirection } from 'shared/store/busStop/Stops'
import { holidaysSelector } from 'shared/store/holidays/holidaysSlice'
import { scheduleSelector, serviceDateSelector } from 'shared/store/schedule/scheduleSlice'
import { addDays, nextDateForDay, nextWeekdayDate, scheduleDay } from 'shared/store/schedule/serviceDate'
import { CardStyled, ContainerStyled } from 'shared/ui'
import { Header } from 'shared/ui/Header/Header'
import { InlineOptions } from 'shared/ui/InlineOptions'
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

	const start = SCHEDULE.circuits?.effectiveFrom
	const dates: Record<string, string> = {
		tomorrow: addDays(today, 1),
		weekday: nextWeekdayDate(today, holidays),
		saturday: nextDateForDay(today, 6),
		sunday: nextDateForDay(today, 0),
		novemberWeekday: nextDateForDay(start ?? today, 1),
		novemberWeekend: start ?? today,
	}
	const DaysOptions: IOption<string>[] = [
		{ label: t(`Tomorrow`), value: `tomorrow` },
		{ label: t(`Weekday`), value: `weekday` },
		{ label: t(`Saturday`), value: `saturday` },
		{ label: t(`Sunday`), value: `sunday` },
		...(start && today < start
			? [
					{ label: `Будни с 7.11`, value: `novemberWeekday` },
					{ label: `Выходные с 7.11`, value: `novemberWeekend` },
			  ]
			: []),
	]
	const [selectedDay, setSelectedDay] = useState(`tomorrow`)
	const busOption = DaysOptions.find(option => option.value === selectedDay) ?? DaysOptions[0]
	const serviceDate = dates[busOption.value]
	const dayKey = scheduleDay(serviceDate, holidays)
	const [previewDirection, setPreviewDirection] = useState<UserDirection | null>(null)
	useEffect(() => setPreviewDirection(null), [busStop, userDirection])
	const availableDirections = busStop
		? getUserDirectionsForLabel(busStop, serviceDate).filter(
				value =>
					!start ||
					serviceDate < start ||
					getScheduleTimes(SCHEDULE, value, dayKey, busStop, serviceDate).length > 0,
		  )
		: []
	const direction =
		previewDirection && availableDirections.includes(previewDirection)
			? previewDirection
			: availableDirections.includes(userDirection)
			? userDirection
			: availableDirections[0] ?? userDirection
	const handleChange = (e: IOption<string> | null): void => {
		if (!e) return
		AndrewLytics(`otherSchedule`)
		setSelectedDay(e.value)
		setPreviewDirection(null)
	}

	const renderOtherTimeContent = useMemo(() => {
		if (!busStop) return <SelectBusStopText />
		const tagged = getScheduleTimes(SCHEDULE, direction, dayKey, busStop, serviceDate)
		if (tagged.length === 0) return <span>В этот день рейсов нет</span>

		return tagged.map(item => {
			const key = `${item.direction}-${item.tripId ?? item.tripIndex}-${item.visitIndex ?? 0}`

			return <TripTimeRow key={key} item={item} />
		})
	}, [busStop, SCHEDULE, direction, dayKey, serviceDate])

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

				{start && serviceDate >= start && (
					<small>С 7 ноября: два пути движения. Подпись у времени показывает путь этого рейса.</small>
				)}
				{busStop && availableDirections.length > 1 && start && serviceDate >= start && (
					<InlineOptions<UserDirection>
						list={availableDirections.map(value => ({
							value,
							label: value === UserDirection.toCity ? `В город` : `Из города`,
						}))}
						activeId={direction}
						onClick={setPreviewDirection}
					/>
				)}
				<OtherTimeStyled>{renderOtherTimeContent}</OtherTimeStyled>
			</CardStyled>
		</ContainerStyled>
	)
}
