import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setDirection } from 'widget/Schedule/model/busStopInfoSlice'
import queryString from 'query-string'
import { DirectionsNew } from 'widget/Schedule/types/Stops'

export const useUrlDirection = () => {
	const dispatch = useDispatch()

	useEffect(() => {
		const parsed = queryString.parse(window.location.search)

		const _direction: DirectionsNew | undefined = ['in', 'out'].includes(parsed['d'] as DirectionsNew)
			? (parsed['d'] as DirectionsNew)
			: undefined

		if (!_direction) return
		dispatch(setDirection(_direction as DirectionsNew))
	}, [])
}
