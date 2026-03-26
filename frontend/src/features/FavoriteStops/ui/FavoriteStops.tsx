/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { busStopSelector, setBusStop, stopsOptionsSelector } from 'shared/store/busStop/busStopInfoSlice'
import { StopKeys } from 'shared/store/busStop/Stops'
import { CardStyled, ContainerStyled } from 'shared/ui'
import { Header } from 'shared/ui/Header'
import { InlineOptions } from 'shared/ui/InlineOptions'

import { favoriteStopsSelector } from '../model/favoriteStopsSlice'

export const FavoriteStops: React.FC = () => {
	const { t } = useTranslation()

	const favoriteBusStops = useSelector(favoriteStopsSelector)
	const stopsOptions = useSelector(stopsOptionsSelector)
	const busStop = useSelector(busStopSelector)
	const dispatch = useDispatch()

	const favoriteList = useMemo(
		() => stopsOptions.filter(stop => stop.value && favoriteBusStops.includes(stop.value)),
		[stopsOptions, favoriteBusStops],
	)

	const handleChangeBusStop = useCallback(
		(busStopToChange: StopKeys | null) => {
			if (busStopToChange) dispatch(setBusStop(busStopToChange))
		},
		[dispatch],
	)

	if (favoriteList.length === 0) return null

	const myStops = t(`My stops`)

	return (
		<ContainerStyled>
			<CardStyled>
				<Header text={myStops} />
				<InlineOptions<StopKeys> list={favoriteList} activeId={busStop} onClick={handleChangeBusStop} />
			</CardStyled>
		</ContainerStyled>
	)
}
