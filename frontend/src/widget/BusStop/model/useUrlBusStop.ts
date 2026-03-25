import { useCallback, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import queryString from 'query-string'
import { setBusStopNew } from 'shared/store/busStop/busStopInfoSlice'
import { DirectionsNew, IStops } from 'shared/store/busStop/Stops'

interface IReturns {
	setQueryParams: (b: IStops<DirectionsNew> | null) => void
}
export const useUrlBusStop = (): IReturns => {
	const dispatch = useDispatch()
	const [searchParams, setSearchParams] = useSearchParams()

	const setQueryParams = useCallback(
		(b: IStops<DirectionsNew> | null): void => {
			if (!b) return

			searchParams.set(`stop`, b.id)
			setSearchParams(searchParams)
		},
		[searchParams, setSearchParams],
	)

	useEffect(() => {
		const parsed = queryString.parse(window.location.search)

		const busStopId = parsed.stop

		if (!busStopId) return
		dispatch(setBusStopNew(busStopId as string))
	}, [dispatch])

	return {
		setQueryParams,
	}
}
