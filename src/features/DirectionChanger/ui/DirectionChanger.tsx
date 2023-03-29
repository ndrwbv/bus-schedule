import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import SVG from 'react-inlinesvg'
import { useDispatch, useSelector } from 'react-redux'
import { AndrewLytics, useTypedSelector } from 'shared/lib'
import { isHalloween } from 'shared/store/app/selectors/isHalloween'
import { directionSelector, setDirection } from 'shared/store/busStop/busStopInfoSlice'
import { DirectionsNew } from 'shared/store/busStop/Stops'
import { CardStyled, ContainerStyled } from 'shared/ui'

import Web from '../img/web.svg'
import {
	DirectionContainerStyled,
	DirectionPlaceholderStyled,
	DirectionTextStyled,
	GoButtonContainerStyled,
	GoButtonStyled,
	WebWrapper,
} from './styled'

const SIZE = 43
export const DirectionChanger = (): JSX.Element => {
	const direction = useSelector(directionSelector)
	const dispatch = useDispatch()
	const isHalloweenMode = useTypedSelector(isHalloween)
	const { t } = useTranslation()

	const [isWebVisible, setIsWebVisible] = useState(true)

	const handleChangeDirection = (value: DirectionsNew): void => {
		const directionToChange = value

		dispatch(setDirection(directionToChange))

		AndrewLytics(`changeDirection`)
	}

	const handleWebClick = (): void => {
		setIsWebVisible(false)
	}

	const onDirectionClick = (): void => {
		handleChangeDirection(direction === DirectionsNew.in ? DirectionsNew.out : DirectionsNew.in)
	}

	return (
		<ContainerStyled>
			<CardStyled>
				{isHalloweenMode && isWebVisible && (
					<WebWrapper w={SIZE} h={SIZE} onClick={handleWebClick}>
						<SVG src={Web} width={SIZE} height={SIZE} uniquifyIDs />
					</WebWrapper>
				)}

				<GoButtonContainerStyled>
					<DirectionContainerStyled>
						<DirectionPlaceholderStyled>Направление</DirectionPlaceholderStyled>
						<DirectionTextStyled>
							{direction === `in` ? t(`In north park`) : t(`Out of north park`)}
						</DirectionTextStyled>
					</DirectionContainerStyled>

					<GoButtonStyled active={direction === `in`} onClick={onDirectionClick}>
						{direction === `in` ? t(`Out of north park`) : t(`In north park`)}
					</GoButtonStyled>
				</GoButtonContainerStyled>
			</CardStyled>
		</ContainerStyled>
	)
}
