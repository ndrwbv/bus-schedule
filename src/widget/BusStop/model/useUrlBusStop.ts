import { useCallback, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import queryString from 'query-string'
import { setBusStop } from 'shared/store/busStop/busStopInfoSlice'
import { StopKeys } from 'shared/store/busStop/Stops'

interface IReturns {
	setQueryParams: (b: string | null) => void
}
export const useUrlBusStop = (): IReturns => {
	const dispatch = useDispatch()
	const [searchParams, setSearchParams] = useSearchParams()

	const setQueryParams = useCallback(
		(b: string | null): void => {
			if (!b) return

			searchParams.set(`b`, b)
			setSearchParams(searchParams)
		},
		[searchParams, setSearchParams],
	)

	useEffect(() => {
		const parsed = queryString.parse(window.location.search)

		const busStopToSet = parsed.b

		if (!busStopToSet) return
		dispatch(setBusStop(busStopToSet as StopKeys))
	}, [dispatch])

	return {
		setQueryParams,
	}
}
