import React, { useMemo } from 'react'
import Select from 'react-select'

import { calculateHowMuchIsLeft, findClosesTime, findClosesTimeArray } from './helpers'

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

import { Directions, IStop, StopKeys, StopKeysIn, StopKeysOut } from 'interfaces/Stops'
import { ITime } from 'interfaces/ITime'

import { StopsOutOptions } from 'consts/stopsOutOptions'
import { StopsInOptions } from 'consts/stopsInOptions'
import { FetchInfoResponse, FetchScheduleResponse } from 'api'
import useSchedule from 'hooks/useSchedule'
import useEveryMinuteUpdater from 'hooks/useEveryMinuteUpdater'
import useFavoriteBusStop, { getFavoriteBusStop } from 'hooks/useFavoriteBusStop'

interface IScheduleProps {
	currentDay: number
	nextDay: number
	fetchSchedule: () => FetchScheduleResponse
	fetchInfo: () => FetchInfoResponse
}
const Schedule: React.FC<IScheduleProps> = ({ currentDay, nextDay, fetchInfo, fetchSchedule }) => {
	const [busStop, setBusStop] = React.useState<StopKeys | null>(null)
	const [left, setLeft] = React.useState<ITime>({
		hours: 0,
		minutes: 0,
	})
	const [closestTimeArray, setClossestTimeArray] = React.useState<string[]>([])
	const [closestTime, setClossestTime] = React.useState<string>('')

	const [direction, setDirection] = React.useState<Directions>('out')
	const [stopsOptions, setStopsOptions] = React.useState<IStop<StopKeysIn | StopKeysOut | null>[]>(StopsOutOptions)
	const [shouldShowFastReply, setShouldShowFastReply] = React.useState(false)

	const SCHEDULE = useSchedule(fetchSchedule)
	const _everyMinuteUpdate = useEveryMinuteUpdater()
	const { favoriteBusStops, saveFavoriteBusStops } = useFavoriteBusStop()

	React.useEffect(() => {
		if (left.hours === null) return

		if (left?.minutes && (left?.minutes <= 15 || left?.minutes > 40)) {
			return setShouldShowFastReply(true)
		}

		return setShouldShowFastReply(false)
	}, [left])

	React.useEffect(() => {
		if (!busStop) return

		const _closestTime = findClosesTime(SCHEDULE[direction][currentDay][busStop])

		if (!_closestTime) return

		if (!closestTime || new Date(closestTime).getTime() !== new Date(_closestTime).getTime()) {
			setClossestTimeArray(findClosesTimeArray(SCHEDULE[direction][currentDay][busStop]))
			setClossestTime(_closestTime)
		}
	}, [_everyMinuteUpdate, closestTime, busStop, direction, SCHEDULE, currentDay])

	React.useEffect(() => {
		const left = calculateHowMuchIsLeft(closestTime)

		setLeft(left)
	}, [_everyMinuteUpdate, closestTime])

	const handleChangeDirection = (_direction: Directions) => {
		const scheduleKeys = Object.keys(SCHEDULE[_direction][currentDay])
		if (busStop && !scheduleKeys.includes(busStop)) {
			setBusStop(scheduleKeys[0] as StopKeys)
		}

		setStopsOptions(_direction === 'in' ? StopsInOptions : StopsOutOptions)
		setDirection(_direction)
	}

	const handleAddFavoriteStatus = () => {
		if (!busStop) return

		const stops = getFavoriteBusStop()

		if (stops.includes(busStop)) return

		const newStops: StopKeys[] = [busStop, ...stops]
		saveFavoriteBusStops(newStops)
		AndrewLytics('addStop')
	}

	const handleRemoveFavoriteStatus = () => {
		if (!busStop) return

		const stops = getFavoriteBusStop()

		if (!stops.includes(busStop)) return

		const newStops: StopKeys[] = stops.filter(stop => stop !== busStop)

		saveFavoriteBusStops(newStops)
	}

	const handleChangeBusStop = (busStop: StopKeys) => {
		AndrewLytics('selectBusStop')
		setBusStop(busStop)
	}

	const renderTodaysBusContent = () => {
		if (!busStop) return <SelectBusStopText />

		return closestTimeArray.length === 0
			? 'Автобусов нет'
			: closestTimeArray.map((d, index) => <TimeStamp key={`${d}-${index}`}>{d}</TimeStamp>)
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
					<GoButton active={direction === 'in'} onClick={() => handleChangeDirection('in')}>
						в северный парк
					</GoButton>
					<GoButton active={direction === 'out'} onClick={() => handleChangeDirection('out')}>
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
					onClick={busStop => setBusStop(busStop as StopKeys)}
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

				<OtherTime>
					{busStop ? (
						SCHEDULE[direction][nextDay][busStop]?.map((d, index) => (
							<TimeStamp key={`${d}-${index}`}>{d}</TimeStamp>
						))
					) : (
						<SelectBusStopText />
					)}
				</OtherTime>
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
