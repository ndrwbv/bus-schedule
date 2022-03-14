import React from 'react'
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
import useSchedule from 'hooks/useSchedule'

import { Directions, IStop, StopKeys, StopKeysIn, StopKeysOut } from 'interfaces/Stops'
import { ITime } from 'interfaces/ITime'

import { StopsOutOptions } from 'consts/stopsOutOptions'
import { StopsInOptions } from 'consts/stopsInOptions'
import { FetchInfoResponse, FetchScheduleResponse } from 'api'
import useInfo from 'hooks/useInfo'

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

	const [_everyMinuteUpdate, _setUpdate] = React.useState(0)
	const [direction, setDirection] = React.useState<Directions>('out')
	const [favoriteBusStops, setFavoriteBusStops] = React.useState<StopKeys[]>([])
	const [stopsOptions, setStopsOptions] = React.useState<IStop<StopKeysIn | StopKeysOut | null>[]>(StopsOutOptions)
	const [shouldShowFastReply, setShouldShowFastReply] = React.useState(false)

	const { SCHEDULE } = useSchedule(fetchSchedule)
	const { infoMessage } = useInfo(fetchInfo)

	const [isInfoShow, setIsInfoShow] = React.useState(false)

	React.useEffect(() => {
		if (!infoMessage.id) return

		const _infoMessageId = localStorage.getItem('infoMessageId')
		Number(_infoMessageId) !== Number(infoMessage.id) && setIsInfoShow(true)
	}, [infoMessage.id])

	React.useEffect(() => {
		const localStorageItem = localStorage.getItem('favoriteStops')
		const favoriteStops = localStorageItem ? JSON.parse(localStorageItem) : []

		setFavoriteBusStops(favoriteStops)
	}, [])

	React.useEffect(() => {
		if (left.hours === null) return

		if (left?.minutes && (left?.minutes <= 15 || left?.minutes > 40)) {
			return setShouldShowFastReply(true)
		}

		return setShouldShowFastReply(false)
	}, [left])

	React.useEffect(() => {
		const int = setInterval(() => _setUpdate(Date.now()), 1000)

		return () => {
			clearInterval(int)
		}
	}, [_everyMinuteUpdate])

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

	const handleVoteClick = () => {
		AndrewLytics('voteClick')
	}

	const saveFavoriteBusStops = (stops: StopKeys[]) => {
		setFavoriteBusStops(stops)
		localStorage.setItem('favoriteStops', JSON.stringify(stops))
	}

	const getFavoriteBusStop = (): StopKeys[] => {
		const localStorageItem = localStorage.getItem('favoriteStops')
		const favoriteStops = localStorageItem ? JSON.parse(localStorageItem) : []

		return favoriteStops
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

	const onInfoCrossClick = () => {
		setIsInfoShow(false)
		infoMessage.id && localStorage.setItem('infoMessageId', String(infoMessage.id))

		AndrewLytics('infoBlockHide')
	}

	const onInfoBlockLinkClick = () => {
		AndrewLytics('infoBlockLinkClick')
	}

	const renderTodaysBusContent = () => {
		if (!busStop) return <SelectBusStopText />

		return closestTimeArray.length === 0
			? 'Автобусов нет'
			: closestTimeArray.map((d, index) => <TimeStamp key={`${d}-${index}`}>{d}</TimeStamp>)
	}

	const isBusStopFavorite = busStop ? favoriteBusStops.includes(busStop) : false

	return (
		<MainLayout>
			{isInfoShow && (
				<Container>
					<Info
						text={infoMessage.message}
						link={infoMessage.link}
						onLinkClick={onInfoBlockLinkClick}
						onInfoCrossClick={onInfoCrossClick}
					></Info>
				</Container>
			)}
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
						value={stopsOptions.find(stop => stop.value === busStop)}
						defaultValue={stopsOptions[0]}
					/>
				</Header>

				<HowMuchLeft busStop={busStop} left={left} shouldShowFastReply={shouldShowFastReply} />
			</Container>

			<Container>
				<Header text={'Мои остановки'} imgSrc={GreenHeart} />
				<InlineOptions
					list={stopsOptions.filter(stop => stop.value && favoriteBusStops.includes(stop.value))}
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
				<Vote key={2} hideCross={true} onVoteClick={handleVoteClick} />
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
