import { useDispatch } from 'react-redux'
import styled from 'styled-components'

import { setLocation, setLocationError, setNoGeolocation } from './model/myLocationSlice'

const GeoLocationStyled = styled.div`
	/* position: absolute; */
	top: -30px;
	left: 10px;
	width: 20px;
	height: 20px;
	background-color: red;
	border-radius: 50%;
`

const getLocation = (
	successCallback: PositionCallback,
	errorCallback: PositionErrorCallback | null | undefined,
	noLocatonCb: () => void,
	options?: PositionOptions | undefined,
): void => {
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(successCallback, errorCallback, options)
	} else {
		noLocatonCb()
	}
}

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

	return <GeoLocationStyled onClick={handleClick} />
}
