import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setBusStop } from 'shared/store/busStop/busStopInfoSlice'
import queryString from 'query-string'
import { StopKeys } from 'shared/store/busStop/Stops'
import { useSearchParams } from 'react-router-dom'

export const useUrlBusStop = () => {
	const dispatch = useDispatch()
	let [searchParams, setSearchParams] = useSearchParams()

	const setQueryParams = (b: string | null) => {
		if (!b) return

		searchParams.set('b', b)
		setSearchParams(searchParams)
	}

	useEffect(() => {
		const parsed = queryString.parse(window.location.search)

		const busStopToSet = parsed['b']

		if (!busStopToSet) return
		dispatch(setBusStop(busStopToSet as StopKeys))
	}, [])

	return {
		setQueryParams,
	}
}
