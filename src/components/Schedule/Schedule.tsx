import React, { useCallback, useMemo } from 'react'
import Select from 'react-select'
import { useTranslation } from 'react-i18next'

import Header from '../Header/Header'
import Vote from '../Vote/Vote'
import Info from '../Info/Info'
import SelectBusStopText from '../SelectBusStopText'
import HowMuchLeft from '../HowMuchLeft/HowMuchLeft'
import InlineOptions from '../InlineOptions/InlineOptions'
import { Card, Container, CustomButton } from 'components/common'
import OtherTimeBusses from 'components/OtherTimeBuses/OtherTimeBuses'

import { AndrewLytics } from 'helpers/analytics'

import { StopKeys } from 'interfaces/Stops'

import useFavoriteBusStop, { getFavoriteBusStop } from 'hooks/useFavoriteBusStop'
import { useScheduleContext } from 'context/ScheduleContext'

import {
	DirectionContainer,
	DirectionPlaceholder,
	DirectionText,
	GoButton,
	GoButtonContainer,
	OtherTime,
	selectStyles,
	TimeStamp,
} from './styled'
import Complains from 'components/Complains/Complains'
import { useComplainsContext } from 'context/ComplainsContext'
import { calculateHowMuchIsLeft, getDateFromTimeCode } from 'helpers/schedule'

interface IScheduleProps {}
const Schedule: React.FC<IScheduleProps> = () => {
	const {
		busStop,
		left,
		closestTime,
		closestTimeArray,
		shouldShowFastReply,
		stopsOptions,
		direction,
		handleChangeBusStop,
		handleChangeDirection,
		todaysHoliday,
		SCHEDULE,
		currentDayKey,
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

	const handleComplain = () => {
		if (!busStop || left.minutes === null) return

		const type = left.minutes > 40 ? 'later' : 'earlier'
		const date = new Date().toISOString()

		let on = left.minutes ?? 0
		if (left.minutes > 40) {
			const d = new Date(closestTime)
			const minutes = d.getMinutes()
			const timeCode = `${d.getHours()}:${minutes <= 9 ? 0 : ''}${minutes}`
			const indexOfSchedule = SCHEDULE[direction][currentDayKey][busStop].indexOf(timeCode)
			const indexPrevSchedule = indexOfSchedule === 0 ? 0 : indexOfSchedule - 1

			const closeDate = new Date(
				getDateFromTimeCode(SCHEDULE[direction][currentDayKey][busStop][indexPrevSchedule]),
			).toISOString()

			on = calculateHowMuchIsLeft(closeDate).minutes ?? 0
		}

		addComplain({
			stop: busStop,
			direction: direction,
			date: date,
			type: type,
			on: on,
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

	console.log(new Date(closestTime).getMinutes())
	return (
		<>
			<Info />
			<Container>
				<Card>
					<GoButtonContainer>
						<DirectionContainer>
							<DirectionPlaceholder>Направление</DirectionPlaceholder>
							<DirectionText>
								{direction === 'in' ? t('In north park') : t('Out of north park')}
							</DirectionText>
						</DirectionContainer>

						<GoButton
							active={direction === 'in'}
							onClick={() => handleChangeDirection(direction === 'in' ? 'out' : 'in')}
						>
							{direction === 'in' ? t('Out of north park') : t('In north park')}
						</GoButton>
					</GoButtonContainer>
				</Card>
			</Container>

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
				<Vote />
			</Container>

			<Container>
				<Card>
					<OtherTimeBusses />
				</Card>
			</Container>
		</>
	)
}

export default Schedule
