import React, { useMemo } from 'react'
import Select from 'react-select'
import { useTranslation } from 'react-i18next'

import { Header } from '../../shared/ui/Header/Header'
import { LeaveFeedbackButton } from 'features/LeaveFeedbackButton'
import { SelectBusStopText } from 'entities/SelectBusStopText'
import HowMuchLeft from '../../features/HowMuchLeft/HowMuchLeft'
import { Card, Container } from 'shared/ui/common'
import { OtherTimeBusses } from 'features/OtherTimeBuses'

import { AndrewLytics } from 'shared/lib'

import { StopKeys } from 'widget/Schedule/types/Stops'

import { useScheduleContext } from 'widget/Schedule/model/ScheduleContext'

import { OtherTime, selectStyles, TimeStamp } from './ui/styled'
import Complains from 'features/Complains/ui/Complains'
import { useComplainsContext } from 'features/Complains/model/ComplainsContext'
import { ComplainType } from 'features/Complains'
import { TranslationLink } from 'entities/TranslationLink'
import { MyStops } from 'features/FavoriteStops/ui/FavoriteStops'
import { FavoriteButton } from 'features/FavoriteStops/ui/FavoriteButton'

interface IScheduleProps {}
const Schedule: React.FC<IScheduleProps> = () => {
	const {
		busStop,
		left,
		closestTimeArray,
		shouldShowFastReply,
		stopsOptions,
		direction,
		handleChangeBusStop,
		todaysHoliday,
	} = useScheduleContext()
	const { addComplain } = useComplainsContext()

	const { t } = useTranslation()

	const renderTodaysBusContent = () => {
		if (!busStop) return <SelectBusStopText />

		return closestTimeArray.length === 0
			? t('No basses')
			: closestTimeArray.map((d, index) => <TimeStamp key={`${d}-${index}`}>{d}</TimeStamp>)
	}

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

	const currentBusStop = useMemo(() => stopsOptions.find(stop => stop.value === busStop), [stopsOptions, busStop])

	return (
		<>
			<Container>
				<Card>
					<Header text={t('Bus stop')}>
						<Select
							isSearchable={false}
							styles={selectStyles}
							options={stopsOptions}
							onChange={e => handleChangeBusStop(e?.value as StopKeys)}
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

			<Complains />

			<TranslationLink />

			<MyStops />

			<Container>
				<Card>
					<Header text={t('Buses for today')} />

					<OtherTime>{renderTodaysBusContent()}</OtherTime>

					<FavoriteButton />
				</Card>
			</Container>

			<Container doubled>
				<LeaveFeedbackButton />
			</Container>

			<OtherTimeBusses />
		</>
	)
}

export default Schedule
