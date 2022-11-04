import React from 'react'
import { useTranslation } from 'react-i18next'

import { Header } from '../../shared/ui/Header/Header'
import { LeaveFeedbackButton } from 'features/LeaveFeedbackButton'
import { SelectBusStopText } from 'entities/SelectBusStopText'
import { Card, Container } from 'shared/ui/common'
import { OtherTimeBusses } from 'features/OtherTimeBuses'

import { useScheduleContext } from 'widget/Schedule/model/ScheduleContext'

import { OtherTime, TimeStamp } from './ui/styled'
import Complains from 'features/Complains/ui/Complains'
import { TranslationLink } from 'entities/TranslationLink'
import { FavoriteStops } from 'features/FavoriteStops/ui/FavoriteStops'
import { FavoriteButton } from 'features/FavoriteStops/ui/FavoriteButton'
import { BusStop } from 'widget/BusStop'
import { useSelector } from 'react-redux'
import { busStopSelector } from './model/busStopInfoSlice'

interface IScheduleProps {}
const Schedule: React.FC<IScheduleProps> = () => {
	const { closestTimeArray } = useScheduleContext()

	const busStop = useSelector(busStopSelector)

	const { t } = useTranslation()

	const renderTodaysBusContent = () => {
		if (!busStop) return <SelectBusStopText />

		return closestTimeArray.length === 0
			? t('No basses')
			: closestTimeArray.map((d, index) => <TimeStamp key={`${d}-${index}`}>{d}</TimeStamp>)
	}

	return (
		<>
			<BusStop />

			<Complains />

			<TranslationLink />

			<FavoriteStops />

			<Container>
				<Card>
					<Header text={t('Buses for today')} />

					<OtherTime>{renderTodaysBusContent()}</OtherTime>

					<FavoriteButton />
				</Card>
			</Container>

			<LeaveFeedbackButton />

			<OtherTimeBusses />
		</>
	)
}

export default Schedule
