import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import SVG from 'react-inlinesvg'
import { Holiday } from 'entities/Holiday'
import { SelectBusStopText } from 'entities/SelectBusStopText'
import { ComplainType } from 'features/Complains'
import { useTypedSelector } from 'shared/lib'
import { isHalloween } from 'shared/store/app/selectors/isHalloween'
import { StopKeys } from 'shared/store/busStop/Stops'
import { IHoliday } from 'shared/store/holidays/IHolidays'
import { ITime } from 'shared/store/timeLeft/ITime'
import { InlineOptions } from 'shared/ui/InlineOptions'

import { ImageWrapper } from '../../shared/ui/ImageWrapper'
import Dead from './img/dead.svg'
import EvilFace from './img/evil-face.svg'
import NextBus from './img/next-bus.svg'
import Pumpkin from './img/pumpkin.svg'
import {
	BusEstimationStyled,
	ComplainOptionContainerStyled,
	HighLightedStyled,
	HowMuchLeftContainerStyled,
	NextBusContainerStyled,
	TextWrapperStyled,
} from './styled'

const SIZE = 45
const COMPLAIN_DISAPPEAR_MS = 200000
const ComplainsOptions = [
	{
		value: ComplainType.earlier,
		label: `Приехал раньше`,
	},
	{
		value: ComplainType.later,
		label: `Приехал позже`,
	},
	{
		value: ComplainType.not_arrive,
		label: `Не приехал`,
	},
]

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
	busStop: StopKeys | null
	shouldShowFastReply: boolean
	holiday: IHoliday | null
	onComplain: (key: ComplainType) => void
}
export const HowMuchLeft: React.FC<ILeftProps> = ({ left, busStop, shouldShowFastReply, holiday, onComplain }) => {
	const [isComplainClicked, setIsComplainClicked] = useState(false)
	const [activeComplain, setActiveComplain] = useState<ComplainType | undefined>(undefined)
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

	const handleFastReplyClick = (key: ComplainType): void => {
		if (isComplainClicked) return

		setActiveComplain(key)
		onComplain(key)
		setIsComplainClicked(true)
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

	useEffect(() => {
		if (isComplainClicked) {
			setTimeout(() => {
				setIsComplainClicked(false)
			}, COMPLAIN_DISAPPEAR_MS)
		}
	}, [isComplainClicked])

	return (
		<>
			<HowMuchLeftContainerStyled isFancy={isFancy} defaultColor={getColorByLeftTime()}>
				<NextBusContainerStyled>
					<ImageWrapper w={SIZE} h={SIZE}>
						<SVG src={currentIcon} width={SIZE} height={SIZE} uniquifyIDs onClick={handleIconClick} />
					</ImageWrapper>

					<BusEstimationStyled>
						<LeftToString busStop={busStop} left={left} />
					</BusEstimationStyled>
				</NextBusContainerStyled>
			</HowMuchLeftContainerStyled>

			{shouldShowFastReply && (
				<ComplainOptionContainerStyled>
					<InlineOptions list={ComplainsOptions} onClick={handleFastReplyClick} activeId={activeComplain} />
				</ComplainOptionContainerStyled>
			)}

			{holiday && <Holiday />}
		</>
	)
}
