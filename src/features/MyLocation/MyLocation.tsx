import { useRef } from 'react'
import SVG from 'react-inlinesvg'
import { useDispatch, useSelector } from 'react-redux'
import { bottomSheetPositionSelector, BottomSheetStates } from 'features/BottomSheet/model/bottomSheetSlice'
import styled from 'styled-components'

import { getLocation } from './helpers/getLocation'
import LocationSVG from './img/location.svg'
import { setLocation, setLocationError, setNoGeolocation } from './model/myLocationSlice'

export const GeoLocationStyled = styled.div<{ top: number }>`
	position: absolute;
	top: ${props => props.top}px;
	left: 10px;

	width: 50px;
	height: 50px;
	background-color: #fff;
	border-radius: 50%;

	display: flex;
	align-items: center;
	justify-content: center;

	z-index: 3;
`

const getTopByPosition = (pos: BottomSheetStates): number => {
	switch (pos) {
		case BottomSheetStates.BOTTOM:
			return 120
		case BottomSheetStates.TOP:
			return 40
		case BottomSheetStates.MID:
			return 80
		default:
			return -100
	}
}
const SIZE = 16
export const MyLocation: React.FC = () => {
	const dispatch = useDispatch()
	const bottomSheetPosition = useSelector(bottomSheetPositionSelector)
	const ref = useRef(document.querySelector(`body > reach-portal > div`))
	console.log(ref, document.querySelector(`body > reach-portal > div`))
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
		<GeoLocationStyled onClick={handleClick} top={getTopByPosition(bottomSheetPosition)}>
			<SVG src={LocationSVG} width={SIZE} height={SIZE} uniquifyIDs />
		</GeoLocationStyled>
	)
}
