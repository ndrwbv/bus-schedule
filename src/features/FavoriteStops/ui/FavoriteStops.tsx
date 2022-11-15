import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { Card, Container } from 'shared/ui'
import { Header } from 'shared/ui/Header'
import { InlineOptions } from 'shared/ui/InlineOptions'
import { busStopSelector, setBusStop, stopsOptionsSelector } from 'shared/store/busStop/busStopInfoSlice'
import { StopKeys } from 'widget/Schedule/types/Stops'
import { favoriteStopsSelector } from '../model/favoriteStopsSlice'

export const FavoriteStops = () => {
	const { t } = useTranslation()

	const favoriteBusStops = useSelector(favoriteStopsSelector)
	const stopsOptions = useSelector(stopsOptionsSelector)
	const busStop = useSelector(busStopSelector)
	const dispatch = useDispatch()

	const favoriteList = useMemo(
		() => stopsOptions.filter(stop => stop.value && favoriteBusStops.includes(stop.value)),
		[stopsOptions, favoriteBusStops],
	)

	const handleChangeBusStop = useCallback((busStop: StopKeys) => {
		dispatch(setBusStop(busStop))
	}, [])

	if (favoriteList.length === 0) return null

	return (
		<Container>
			<Card>
				<Header text={t('My stops')} />
				<InlineOptions list={favoriteList} activeId={busStop} onClick={handleChangeBusStop} />
			</Card>
		</Container>
	)
}
