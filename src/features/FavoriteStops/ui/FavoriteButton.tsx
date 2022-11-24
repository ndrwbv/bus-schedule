import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { AndrewLytics } from 'shared/lib'
import { busStopSelector } from 'shared/store/busStop/busStopInfoSlice'
import { StopKeys } from 'shared/store/busStop/Stops'
import { CustomButtonStyled } from 'shared/ui'

import { favoriteStopsSelector, saveFavoriteBusStops } from '../model/favoriteStopsSlice'

export const FavoriteButton: React.FC = () => {
	const { t } = useTranslation()
	const busStop = useSelector(busStopSelector)
	const favoriteBusStops = useSelector(favoriteStopsSelector)
	const dispatch = useDispatch()

	const handleAddFavoriteStatus = useCallback(() => {
		if (!busStop) return

		if (favoriteBusStops.includes(busStop)) return

		const newStops: StopKeys[] = [busStop, ...favoriteBusStops]
		dispatch(saveFavoriteBusStops(newStops))

		AndrewLytics(`addStop`)
	}, [busStop, favoriteBusStops, dispatch])

	const handleRemoveFavoriteStatus = useCallback(() => {
		if (!busStop) return

		if (!favoriteBusStops.includes(busStop)) return

		const newStops: StopKeys[] = favoriteBusStops.filter(stop => stop !== busStop)
		dispatch(saveFavoriteBusStops(newStops))
	}, [busStop, favoriteBusStops, dispatch])

	const isBusStopFavorite = useMemo(
		() => (busStop ? favoriteBusStops.includes(busStop) : false),
		[busStop, favoriteBusStops],
	)

	return (
		<CustomButtonStyled
			status={isBusStopFavorite ? `danger` : `primary`}
			mt="12px"
			onClick={isBusStopFavorite ? handleRemoveFavoriteStatus : handleAddFavoriteStatus}
		>
			{isBusStopFavorite ? t(`Remove stop from favorite`) : t(`Add stop to favorite`)}
		</CustomButtonStyled>
	)
}
