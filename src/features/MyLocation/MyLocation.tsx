import SVG from 'react-inlinesvg'
import { useDispatch } from 'react-redux'
import styled from 'styled-components'

import { getLocation } from './helpers/getLocation'
import LocationSVG from './img/location.svg'
import { setLocation, setLocationError, setNoGeolocation } from './model/myLocationSlice'

export const GeoLocationStyled = styled.div`
	width: 50px;
	height: 50px;
	background-color: #fff;
	border-radius: 50%;

	display: flex;
	align-items: center;
	justify-content: center;

	z-index: 3;

	box-shadow: 0px 1px 13px rgba(0, 0, 0, 0.08);
`
const SIZE = 16
export const MyLocation: React.FC = () => {
	const dispatch = useDispatch()

	const onSuccess = (position: GeolocationPosition): void => {
		dispatch(
			setLocation({
				coords: {
					accuracy: position.coords.accuracy,
					altitude: position.coords.altitude,
					altitudeAccuracy: position.coords.altitudeAccuracy,
					heading: position.coords.heading,
					latitude: position.coords.latitude,
					longitude: position.coords.longitude,
					speed: position.coords.speed,
				},
				timestamp: position.timestamp,
			}),
		)
	}

	const onError = (data: GeolocationPositionError): void => {
		dispatch(
			setLocationError({
				code: data.code,
				message: data.message,
				PERMISSION_DENIED: data.PERMISSION_DENIED,
				POSITION_UNAVAILABLE: data.POSITION_UNAVAILABLE,
				TIMEOUT: data.TIMEOUT,
			}),
		)
	}

	const onNoLocation = (): void => {
		dispatch(setNoGeolocation(true))
	}

	const handleClick = (): void => {
		getLocation(onSuccess, onError, onNoLocation)
	}

	return (
		<GeoLocationStyled onClick={handleClick}>
			<SVG src={LocationSVG} width={SIZE} height={SIZE} uniquifyIDs />
		</GeoLocationStyled>
	)
}
