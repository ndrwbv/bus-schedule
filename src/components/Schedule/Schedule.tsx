import React, { useCallback, useMemo } from 'react'
import Select from 'react-select'

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

import { FetchInfoResponse, FetchScheduleResponse } from 'api'

import useFavoriteBusStop, { getFavoriteBusStop } from 'hooks/useFavoriteBusStop'
import { useScheduleContext } from 'context/ScheduleContext'

interface IScheduleProps {
	currentDay: number
	nextDay: number
	fetchSchedule: () => FetchScheduleResponse
	fetchInfo: () => FetchInfoResponse
}
const Schedule: React.FC<IScheduleProps> = ({ currentDay, nextDay, fetchInfo }) => {
	
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
	} = useScheduleContext()

	const { favoriteBusStops, saveFavoriteBusStops } = useFavoriteBusStop()



	const handleAddFavoriteStatus = useCallback(() => {
		if (!busStop) return

		const stops = getFavoriteBusStop()

		if (stops.includes(busStop)) return

		const newStops: StopKeys[] = [busStop, ...stops]
		saveFavoriteBusStops(newStops)
		AndrewLytics('addStop')
	}, [busStop])

	const handleRemoveFavoriteStatus = useCallback(() => {
		if (!busStop) return

		const stops = getFavoriteBusStop()

		if (!stops.includes(busStop)) return

		const newStops: StopKeys[] = stops.filter(stop => stop !== busStop)

		saveFavoriteBusStops(newStops)
	}, [busStop])

	const renderTodaysBusContent = () => {
		if (!busStop) return <SelectBusStopText />

		return closestTimeArray.length === 0
			? 'Автобусов нет'
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
				<Info fetchInfo={fetchInfo} />
			</Container>

			<Container>
				<GoButtonContainer>
					<GoButton active={direction === 'in'} onClick={changeDirectionIn}>
						в северный парк
					</GoButton>
					<GoButton active={direction === 'out'} onClick={changeDirectionOut}>
						из северного парка
					</GoButton>
				</GoButtonContainer>
			</Container>

			<Container>
				<Header text={'Остановка'} imgSrc={BusStop}>
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
				<Header text={'Мои остановки'} imgSrc={GreenHeart} />
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
				<Header text={'Ещё автобусы на сегодня'} imgSrc={UpcomingBus} />

				<OtherTime>{renderTodaysBusContent()}</OtherTime>

				{busStop && (
					<AddToFavoriteButton
						status={isBusStopFavorite ? 'remove' : 'add'}
						onClick={isBusStopFavorite ? handleRemoveFavoriteStatus : handleAddFavoriteStatus}
					>
						{isBusStopFavorite ? 'Удалить остановку из избранного' : 'Добавить остановку в избранное'}
					</AddToFavoriteButton>
				)}
			</Container>

			<Container>
				<Vote />
			</Container>

			<Container>
				<Header text={'Автобусы на завтра'} imgSrc={UpcomingBus} />

				<OtherTime>{renderOtherTimeContent()}</OtherTime>
			</Container>

			<Container>
				<Header
					text={() => (
						<>
							Увидели ошибку?
							<br />
							Есть предложение по улучшению?
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
						Расписание взято с сайта{' '}
						<a href="http://www.tomskavtotrans.ru/60" target="_blank" rel="noreferrer">
							tomskavtotrans.ru
						</a>
					</GrayText>

					<GrayText>© Andrew Boev & Friends</GrayText>
				</LinksBlock>
			</Container>
		</MainLayout>
	)
}

export default Schedule
