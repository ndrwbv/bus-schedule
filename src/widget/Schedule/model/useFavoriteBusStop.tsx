import React from 'react'
import { StopKeys } from 'interfaces/Stops'

export const getFavoriteBusStop = (): StopKeys[] => {
	const localStorageItem = localStorage.getItem('favoriteStops')
	const favoriteStops = localStorageItem ? JSON.parse(localStorageItem) : []

	return favoriteStops
}

const useFavoriteBusStop = () => {
	const [favoriteBusStops, setFavoriteBusStops] = React.useState<StopKeys[]>([])

	const saveFavoriteBusStops = (stops: StopKeys[]) => {
		setFavoriteBusStops(stops)
		localStorage.setItem('favoriteStops', JSON.stringify(stops))
	}

	React.useEffect(() => {
		setFavoriteBusStops(getFavoriteBusStop())
	}, [])

	return {
		favoriteBusStops,
		saveFavoriteBusStops,
	}
}

export default useFavoriteBusStop
