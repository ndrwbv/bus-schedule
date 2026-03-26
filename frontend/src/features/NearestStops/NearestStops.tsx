import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getDirectionString } from 'features/Complains/helpers'
import { userLocationSelector } from 'features/MyLocation/model/myLocationSlice'
import L from 'leaflet'
import { setBusStopNew } from 'shared/store/busStop/busStopInfoSlice'
import { STOPS } from 'shared/store/busStop/const/stops'
import { DirectionsNew, IStops } from 'shared/store/busStop/Stops'
import { CardStyled, ContainerStyled } from 'shared/ui'

import {
	NearestStopsDirectionStyled,
	NearestStopsLabelStyled,
	NearestStopsStyled,
	NearestStopStyled,
} from './NearestStops.styled'

const MAX_DISTANCE = 300

interface INearestStopProps extends IStops<DirectionsNew> {
	onClick: (id: string) => void
}

const NearestStop: React.FC<INearestStopProps> = ({ direction, label, id, onClick }) => {
	const handleClick = (): void => onClick(id)

	return (
		<NearestStopStyled onClick={handleClick}>
			<NearestStopsLabelStyled>{label}</NearestStopsLabelStyled>
			<NearestStopsDirectionStyled>{getDirectionString(direction)}</NearestStopsDirectionStyled>
		</NearestStopStyled>
	)
}
export const NearestStops: React.FC = () => {
	const userLocation = useSelector(userLocationSelector)
	const dispatch = useDispatch()
	const [stops, setStops] = useState<IStops<DirectionsNew>[]>([])

	useEffect(() => {
		if (userLocation) {
			const nearestStops = STOPS.filter(
				stop =>
					L.latLng([userLocation.coords.latitude, userLocation.coords.longitude]).distanceTo(stop.latLon) <
					MAX_DISTANCE,
			)

			setStops(nearestStops)
		}
	}, [userLocation])

	const onStopClick = useCallback(
		(id: string) => {
			dispatch(setBusStopNew(id))
		},
		[dispatch],
	)

	if (stops.length === 0) return null

	return (
		<ContainerStyled>
			<CardStyled>
				<NearestStopsStyled>
					{stops.map(stop => (
						<NearestStop {...stop} onClick={onStopClick} key={stop.id} />
					))}
				</NearestStopsStyled>
			</CardStyled>
		</ContainerStyled>
	)
}
