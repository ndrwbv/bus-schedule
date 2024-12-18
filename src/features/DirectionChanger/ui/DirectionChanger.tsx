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

const directions = {
	inSP: {
		value: 'inSP',
		text: `In north park`
	},
	inLB: {
		value: 'inLB',
		text: `In left bank`
	},
	out: {
		value: 'out',
		text: `In tomsk`
	}
}

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
		handleChangeDirection(direction === DirectionsNew.inSP ? DirectionsNew.out : DirectionsNew.inSP)
	}

	return (
		<ContainerStyled>
			<CardStyled>
				{isHalloweenMode && isWebVisible && (
					<WebWrapper $w={SIZE} $h={SIZE} onClick={handleWebClick}>
						<SVG src={Web} width={SIZE} height={SIZE} uniquifyIDs />
					</WebWrapper>
				)}

				<GoButtonContainerStyled>
					<DirectionContainerStyled>
						<DirectionPlaceholderStyled>Направление</DirectionPlaceholderStyled>
						<DirectionTextStyled>
							{direction === `inSP` ? t(`In north park`) : direction === `inLB` ? t(`In left bank`) : t(`Out of north park`)}
						</DirectionTextStyled>
					</DirectionContainerStyled>

					<GoButtonStyled $active={direction === `inSP`} onClick={onDirectionClick}>
						{direction === `inSP` ? t(`Out of north park`) : t(`In north park`)}
					</GoButtonStyled>
					<GoButtonStyled $active={direction === `inLB`} onClick={onDirectionClick}>
						{direction === `inSP` ? t(`Out of north park`) : t(`In north park`)}
					</GoButtonStyled>
				</GoButtonContainerStyled>
			</CardStyled>
		</ContainerStyled>
	)
}
