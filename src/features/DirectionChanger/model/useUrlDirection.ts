import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setDirection } from 'shared/store/busStop/busStopInfoSlice'
import queryString from 'query-string'
import { DirectionsNew } from 'widget/Schedule/types/Stops'
import { useSearchParams } from 'react-router-dom'

export const useUrlDirection = () => {
	const dispatch = useDispatch()
	let [searchParams, setSearchParams] = useSearchParams()

	const setQueryParams = (d: DirectionsNew) => {
		searchParams.set('d', d)
		setSearchParams(searchParams)
	}

	useEffect(() => {
		const parsed = queryString.parse(window.location.search)

		const _direction: DirectionsNew | undefined = ['in', 'out'].includes(parsed['d'] as DirectionsNew)
			? (parsed['d'] as DirectionsNew)
			: undefined

		if (!_direction) {
			setQueryParams(DirectionsNew.out)
			return
		}
		
		dispatch(setDirection(_direction as DirectionsNew))
	}, [])

	return {
		setQueryParams,
	}
}
