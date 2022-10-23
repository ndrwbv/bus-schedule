import React, { useCallback, useMemo } from 'react'
import Select from 'react-select'
import { useTranslation } from 'react-i18next'

import { Header } from '../../shared/ui/Header/Header'
import { LeaveFeedbackButton } from 'features/LeaveFeedbackButton'
import { Info } from 'features/Info'
import { SelectBusStopText } from 'entities/SelectBusStopText'
import HowMuchLeft from '../../features/HowMuchLeft/HowMuchLeft'
import { InlineOptions } from '../../shared/ui/InlineOptions'
import { Card, Container, CustomButton } from 'shared/ui/common'
import { OtherTimeBusses } from 'features/OtherTimeBuses'

import { AndrewLytics } from 'shared/lib'

import { StopKeys } from 'widget/Schedule/types/Stops'

import useFavoriteBusStop, { getFavoriteBusStop } from './model/useFavoriteBusStop'
import { useScheduleContext } from 'widget/Schedule/model/ScheduleContext'

import { OtherTime, selectStyles, TimeStamp, TranslationLink } from './ui/styled'
import Complains from 'features/Complains/ui/Complains'
import { useComplainsContext } from 'features/Complains/model/ComplainsContext'
import { TRANSLATION_LINK } from 'shared/common'
import { ComplainType } from 'features/Complains'
import { DirectionChanger } from 'features/DirectionChanger'

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
	const { favoriteBusStops, saveFavoriteBusStops } = useFavoriteBusStop()
	const { addComplain } = useComplainsContext()

	const { t } = useTranslation()

	const handleAddFavoriteStatus = useCallback(() => {
		if (!busStop) return

		const stops = getFavoriteBusStop()

		if (stops.includes(busStop)) return

		const newStops: StopKeys[] = [busStop, ...stops]
		saveFavoriteBusStops(newStops)
		AndrewLytics('addStop')
	}, [busStop, saveFavoriteBusStops])

	const handleRemoveFavoriteStatus = useCallback(() => {
		if (!busStop) return

		const stops = getFavoriteBusStop()

		if (!stops.includes(busStop)) return

		const newStops: StopKeys[] = stops.filter(stop => stop !== busStop)

		saveFavoriteBusStops(newStops)
	}, [busStop, saveFavoriteBusStops])

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

	const favoriteList = useMemo(
		() => stopsOptions.filter(stop => stop.value && favoriteBusStops.includes(stop.value)),
		[stopsOptions, favoriteBusStops],
	)

	const isBusStopFavorite = useMemo(
		() => (busStop ? favoriteBusStops.includes(busStop) : false),
		[busStop, favoriteBusStops],
	)

	const currentBusStop = useMemo(() => stopsOptions.find(stop => stop.value === busStop), [stopsOptions, busStop])

	return (
		<>
			<Info />
			<DirectionChanger />

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

			<Container>
				<Card>
					<Complains />
				</Card>
			</Container>

			<Container>
				<TranslationLink
					href={TRANSLATION_LINK}
					target="_blank"
					onClick={() => AndrewLytics('clickTranslation')}
				>
					Онлайн трансляция с моста
				</TranslationLink>
			</Container>

			{favoriteList.length !== 0 && (
				<Container>
					<Card>
						<Header text={t('My stops')} />
						<InlineOptions
							list={favoriteList}
							activeId={busStop}
							onClick={busStop => handleChangeBusStop(busStop as StopKeys, undefined)}
						/>
					</Card>
				</Container>
			)}

			<Container>
				<Card>
					<Header text={t('Buses for today')} />

					<OtherTime>{renderTodaysBusContent()}</OtherTime>

					{busStop && (
						<CustomButton
							status={isBusStopFavorite ? 'danger' : 'primary'}
							mt="12px"
							onClick={isBusStopFavorite ? handleRemoveFavoriteStatus : handleAddFavoriteStatus}
						>
							{isBusStopFavorite ? t('Remove stop from favorite') : t('Add stop to favorite')}
						</CustomButton>
					)}
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
