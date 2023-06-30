import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import SVG from 'react-inlinesvg'
import { Holiday } from 'entities/Holiday'
import { SelectBusStopText } from 'entities/SelectBusStopText'
import { Fastreply } from 'features/Complains/ui/Fastreply'
import { useTypedSelector } from 'shared/lib'
import { isHalloween } from 'shared/store/app/selectors/isHalloween'
import { StopKeys } from 'shared/store/busStop/Stops'
import { IHoliday } from 'shared/store/holidays/IHolidays'
import { ITime } from 'shared/store/timeLeft/ITime'

import { ImageWrapperStyled } from '../../shared/ui/ImageWrapper'
import {
	BusEstimationStyled,
	HighLightedStyled,
	HowMuchLeftContainerStyled,
	NextBusContainerStyled,
	TextWrapperStyled,
} from './HowMuchLeft.styled'
import Dead from './img/dead.svg'
import EvilFace from './img/evil-face.svg'
import NextBus from './img/next-bus.svg'
import Pumpkin from './img/pumpkin.svg'

const SIZE = 45

export const LeftToString: React.FC<{ left: ITime; busStop: StopKeys | null }> = ({ busStop, left }) => {
	const { t } = useTranslation()

	if (!busStop) return <SelectBusStopText />

	if (left.hours === null && left.minutes === null)
		return (
			<TextWrapperStyled>
				{t(`Bus on stop`)} <b>{busStop}</b> {t(`today wont arrive`)}
			</TextWrapperStyled>
		)

	const leftString = left.hours || `0`

	return (
		<TextWrapperStyled>
			{t(`Next bus arriving in`)}
			{` `}
			<HighLightedStyled>
				{left.hours === 0 ? `` : `${leftString}ч `}
				{left.minutes}м
			</HighLightedStyled>
		</TextWrapperStyled>
	)
}

interface ILeftProps {
	left: ITime
	busStopLabel: StopKeys | null
	holiday: IHoliday | null
}

export const HowMuchLeft: React.FC<ILeftProps> = ({ left, busStopLabel, holiday }) => {
	const isHalloweenMode = useTypedSelector(isHalloween)
	const isFancy = isHalloweenMode || !!holiday
	const [currentIcon, setIcon] = useState(isHalloweenMode ? Pumpkin : NextBus)
	const [iconClickCounter, setIconClickCounter] = useState(0)

	const getColorByLeftTime = (): string => {
		if (left.hours === null || left.minutes === null || left.hours >= 1) return `#e7edec`

		if (left.minutes > 15 && left.minutes < 35) return `#E4F5D6`
		if (left.minutes <= 15) return `#FBDCDC`

		return `#e7edec`
	}

	const handleIconClick = (): void => {
		setIconClickCounter(prev => prev + 1)
	}

	useEffect(() => {
		if (!isHalloweenMode) return
		if (iconClickCounter > 18) {
			setIcon(Dead)

			return
		}

		if (iconClickCounter % 2 === 0) {
			setIcon(Pumpkin)
		} else {
			setIcon(EvilFace)
		}
	}, [iconClickCounter, isHalloweenMode])

	return (
		<>
			<HowMuchLeftContainerStyled isFancy={isFancy} defaultColor={getColorByLeftTime()}>
				<NextBusContainerStyled>
					<ImageWrapperStyled w={SIZE} h={SIZE}>
						<SVG src={currentIcon} width={SIZE} height={SIZE} uniquifyIDs onClick={handleIconClick} />
					</ImageWrapperStyled>

					<BusEstimationStyled>
						<LeftToString busStop={busStopLabel} left={left} />
					</BusEstimationStyled>
				</NextBusContainerStyled>
			</HowMuchLeftContainerStyled>

			<Fastreply />

			{holiday && <Holiday />}
		</>
	)
}
