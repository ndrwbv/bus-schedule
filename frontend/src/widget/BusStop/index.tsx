import { useCallback, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import Select, { SingleValue } from 'react-select'
import { Fastreply } from 'features/Complains'
import { HowMuchLeft } from 'features/HowMuchLeft/HowMuchLeft'
import { AndrewLytics } from 'shared/lib'
import { IOption, StopKeys, UserDirection } from 'shared/store/busStop/Stops'
import { todayHolidaySelector } from 'shared/store/holidays/holidaysSlice'
import { leftSelector } from 'shared/store/timeLeft/timeLeftSlice'
import { useTimeLeftUpdater } from 'shared/store/timeLeft/useTimeLeftUpdater'
import { CardStyled, ContainerStyled } from 'shared/ui'
import { Header } from 'shared/ui/Header'
import { InlineOptions } from 'shared/ui/InlineOptions'
import { selectStyles } from 'shared/ui/SelectStyles'

import {
	availableUserDirectionsSelector,
	busStopNewSelector,
	setBusStop,
	setUserDirection,
	stopsOptionsSelector,
	userDirectionSelector,
} from '../../shared/store/busStop/busStopInfoSlice'
import { useUrlBusStop } from './model/useUrlBusStop'

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

	const handleChangeBusStop = useCallback(
		(e: SingleValue<IOption<string | null>>) => {
			if (!e?.value) return

			const busStopToChange = e.value as StopKeys

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

	useEffect(() => {
		setQueryParams(busStopNew)
	}, [busStopNew, setQueryParams])

	const currentBusStop = useMemo(
		() => stopsOptions.find(stop => stop.value === busStopNew?.label),
		[stopsOptions, busStopNew],
	) // TODO remove find

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
					<Select
						isSearchable={false}
						styles={selectStyles}
						options={stopsOptions}
						onChange={handleChangeBusStop}
						value={currentBusStop}
						defaultValue={stopsOptions[0]}
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

				<HowMuchLeft holiday={todaysHoliday} busStopLabel={busStopNew?.label || null} left={left} />

				<Fastreply />
			</CardStyled>
		</ContainerStyled>
	)
}
