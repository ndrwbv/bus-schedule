import React, { useCallback, useMemo } from 'react'
import Select from 'react-select'
import { useTranslation } from 'react-i18next'

import GreenHeart from 'img/green-heart.svg'
import BusStop from 'img/bus-stop.svg'
import UpcomingBus from 'img/upcoming-bus.svg'
import Write from 'img/write.svg'

import Header from '../Header/Header'
import TelegramButton from '../TelegramButton/TelegramButton'
import Vote from '../Vote/Vote'
import Info from '../Info/Info'
import SelectBusStopText from '../SelectBusStopText'
import HowMuchLeft from '../HowMuchLeft/HowMuchLeft'
import InlineOptions from '../InlineOptions/InlineOptions'
import {
	AddToFavoriteButton,
	Container,
	GoButton,
	GoButtonContainer,
	GrayText,
	LinksBlock,
	MainLayout,
	OtherTime,
	selectStyles,
	StyledHR,
	TelegramContainer,
	TimeStamp,
} from './styled'

import { AndrewLytics } from 'helpers/analytics'

import { StopKeys } from 'interfaces/Stops'

import useFavoriteBusStop, { getFavoriteBusStop } from 'hooks/useFavoriteBusStop'
import { useScheduleContext } from 'context/ScheduleContext'

import config from 'configs/base'
import { AVTOTRANS, COPIRIGHT } from 'consts/strings'

interface IScheduleProps {}
const Schedule: React.FC<IScheduleProps> = () => {
	const {
		busStop,
		left,
		closestTimeArray,
		shouldShowFastReply,
		stopsOptions,
		direction,
		SCHEDULE,
		handleChangeBusStop,
		changeDirectionIn,
		changeDirectionOut,
		nextDay,
	} = useScheduleContext()
	const { favoriteBusStops, saveFavoriteBusStops } = useFavoriteBusStop()

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

	const renderOtherTimeContent = () => {
		return busStop ? (
			SCHEDULE[direction][nextDay][busStop]?.map((d, index) => <TimeStamp key={`${d}-${index}`}>{d}</TimeStamp>)
		) : (
			<SelectBusStopText />
		)
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
		<MainLayout>
			<Container>
				<Info />
			</Container>

			<Container>
				<GoButtonContainer>
					<GoButton active={direction === 'in'} onClick={changeDirectionIn}>
						{t('In north park')}
					</GoButton>
					<GoButton active={direction === 'out'} onClick={changeDirectionOut}>
						{t('Out of north park')}
					</GoButton>
				</GoButtonContainer>
			</Container>

			<Container>
				<Header text={t('Bus stop')} imgSrc={BusStop}>
					<Select
						isSearchable={false}
						styles={selectStyles}
						options={stopsOptions}
						onChange={e => handleChangeBusStop(e?.value as StopKeys)}
						value={currentBusStop}
						defaultValue={stopsOptions[0]}
					/>
				</Header>

				<HowMuchLeft busStop={busStop} left={left} shouldShowFastReply={shouldShowFastReply} />
			</Container>

			<Container>
				<Header text={t('My stops')} imgSrc={GreenHeart} />
				<InlineOptions
					list={favoriteList}
					activeId={busStop}
					onClick={busStop => handleChangeBusStop(busStop as StopKeys, undefined)}
				/>
			</Container>

			<Container>
				<StyledHR />
			</Container>

			<Container>
				<Header text={t('Buses for today')} imgSrc={UpcomingBus} />

				<OtherTime>{renderTodaysBusContent()}</OtherTime>

				{busStop && (
					<AddToFavoriteButton
						status={isBusStopFavorite ? 'remove' : 'add'}
						onClick={isBusStopFavorite ? handleRemoveFavoriteStatus : handleAddFavoriteStatus}
					>
						{isBusStopFavorite ? t('Remove stop from favorite') : t('Add stop to favorite')}
					</AddToFavoriteButton>
				)}
			</Container>

			<Container>
				<Vote />
			</Container>

			<Container>
				<Header text={t('Buses for tommorow')} imgSrc={UpcomingBus} />

				<OtherTime>{renderOtherTimeContent()}</OtherTime>
			</Container>

			<Container>
				<Header
					text={() => (
						<>
							{t('Did you see an error?')}
							<br />
							{t('Have a suggestion for improvement?')}
						</>
					)}
					imgSrc={Write}
				/>

				<TelegramContainer>
					<TelegramButton />
				</TelegramContainer>
			</Container>

			<Container>
				<LinksBlock>
					<GrayText>
						{t('Schedule taken from website')}{' '}
						<a href={config.AVTOTRANS_LINK} target="_blank" rel="noreferrer">
							{AVTOTRANS}
						</a>
					</GrayText>

					<GrayText>{COPIRIGHT}</GrayText>
				</LinksBlock>
			</Container>
		</MainLayout>
	)
}

export default Schedule
