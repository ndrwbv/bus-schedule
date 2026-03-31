import React from 'react'
import SVG from 'react-inlinesvg'
import { useDispatch } from 'react-redux'

import { getLocation } from './helpers/getLocation'
import LocationSVG from './img/location.svg'
import { setLocation, setLocationError, setNoGeolocation } from './model/myLocationSlice'
import styles from './MyLocation.module.css'

export const GeoLocationStyled: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
	<div className={[styles.geoLocation, className].filter(Boolean).join(` `)} {...props} />
)

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
