import { useTranslation } from 'react-i18next'
import SVG from 'react-inlinesvg'
import Web from '../img/web.svg'

import { Card, Container } from 'shared/ui'
import {
	DirectionContainer,
	DirectionPlaceholder,
	DirectionText,
	GoButton,
	GoButtonContainer,
	WebWrapper,
} from './styled'
import { AndrewLytics, useTypedSelector } from 'shared/lib'
import { isHalloween } from 'App/model/selectors/isHalloween'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { directionSelector, setDirection } from 'widget/Schedule/model/busStopInfoSlice'
import { DirectionsNew } from 'widget/Schedule/types/Stops'
import { useUrlDirection } from '../model/useUrlDirection'
import { useSearchParams } from 'react-router-dom'

const SIZE = 43
export const DirectionChanger = () => {
	useUrlDirection()
	const direction = useSelector(directionSelector)
	const dispatch = useDispatch()
	let [searchParams, setSearchParams] = useSearchParams()
	const isHalloweenMode = useTypedSelector(isHalloween)
	const { t } = useTranslation()

	const [isWebVisible, setIsWebVisible] = useState(true)

	const setQueryParams = (d: DirectionsNew) => {
		searchParams.set('d', d)
		setSearchParams(searchParams)
	}

	const handleChangeDirection = (_direction: DirectionsNew) => {
		const directionToChange = _direction as DirectionsNew

		dispatch(setDirection(directionToChange))

		AndrewLytics('changeDirection')
	}

	const handleWebClick = () => {
		setIsWebVisible(false)
	}

	const onDirectionClick = () => {
		handleChangeDirection(direction === DirectionsNew.in ? DirectionsNew.out : DirectionsNew.in)
	}

	useEffect(() => {
		setQueryParams(direction)
	}, [direction])

	return (
		<Container>
			<Card>
				{isHalloweenMode && isWebVisible && (
					<WebWrapper w={SIZE} h={SIZE} onClick={handleWebClick}>
						<SVG src={Web} width={SIZE} height={SIZE} uniquifyIDs={true} />
					</WebWrapper>
				)}

				<GoButtonContainer>
					<DirectionContainer>
						<DirectionPlaceholder>Направление</DirectionPlaceholder>
						<DirectionText>
							{direction === 'in' ? t('In north park') : t('Out of north park')}
						</DirectionText>
					</DirectionContainer>

					<GoButton active={direction === 'in'} onClick={onDirectionClick}>
						{direction === 'in' ? t('Out of north park') : t('In north park')}
					</GoButton>
				</GoButtonContainer>
			</Card>
		</Container>
	)
}
