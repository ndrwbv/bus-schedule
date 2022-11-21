import { useCallback, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import queryString from 'query-string'
import { setDirection } from 'shared/store/busStop/busStopInfoSlice'
import { DirectionsNew } from 'shared/store/busStop/Stops'

interface IReturns {
	setQueryParams: (d: DirectionsNew) => void
}

export const useUrlDirection = (): IReturns => {
	const dispatch = useDispatch()
	const [searchParams, setSearchParams] = useSearchParams()

	const setQueryParams = useCallback(
		(d: DirectionsNew) => {
			searchParams.set(`d`, d)
			setSearchParams(searchParams)
		},
		[searchParams, setSearchParams],
	)

	useEffect(() => {
		const parsed = queryString.parse(window.location.search)

		const diretionToSet: DirectionsNew | undefined = [`in`, `out`].includes(parsed.d as DirectionsNew)
			? (parsed.d as DirectionsNew)
			: undefined

		if (!diretionToSet) {
			setQueryParams(DirectionsNew.out)

			return
		}

		dispatch(setDirection(diretionToSet))
	}, [dispatch, setQueryParams])

	return {
		setQueryParams,
	}
}
