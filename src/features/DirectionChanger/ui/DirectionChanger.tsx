// eslint-disable no-nested-ternary
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
							{direction === DirectionsNew.inSP
								? t(`In north park`)
								: direction === DirectionsNew.inLB
								? t(`In left bank`)
								: t(`In city`)}
						</DirectionTextStyled>
					</DirectionContainerStyled>

					<GoButtonStyled
						$active={direction === DirectionsNew.inSP}
						onClick={() => handleChangeDirection(DirectionsNew.inSP)}
					>
						{t(`In north park`)}
					</GoButtonStyled>

					<GoButtonStyled
						$active={direction === DirectionsNew.inLB}
						onClick={() => handleChangeDirection(DirectionsNew.inLB)}
					>
						{t(`In left bank`)}
					</GoButtonStyled>

					<GoButtonStyled
						$active={direction === DirectionsNew.out}
						onClick={() => handleChangeDirection(DirectionsNew.out)}
					>
						{t(`In city`)}
					</GoButtonStyled>
				</GoButtonContainerStyled>
			</CardStyled>
		</ContainerStyled>
	)
}
