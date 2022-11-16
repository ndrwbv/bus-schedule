import React, { useEffect, useState } from 'react'
import SVG from 'react-inlinesvg'
import { useTranslation } from 'react-i18next'

import { ITime } from 'shared/store/timeLeft/ITime'
import { StopKeys } from 'shared/store/busStop/Stops'
import NextBus from './img/next-bus.svg'
import Pumpkin from './img/pumpkin.svg'
import EvilFace from './img/evil-face.svg'
import Dead from './img/dead.svg'

import { ImageWrapper } from '../../shared/ui/ImageWrapper'
import { SelectBusStopText } from 'entities/SelectBusStopText'

import { Holiday } from 'entities/Holiday'
import { IHoliday } from 'shared/store/holidays/IHolidays'
import { InlineOptions } from 'shared/ui/InlineOptions'
import { ComplainType } from 'features/Complains'

import {
	BusEstimation,
	ComplainOptionContainer,
	HighLighted,
	HowMuchLeftContainer,
	NextBusContainer,
	TextWrapper,
} from './styled'
import { useTypedSelector } from 'shared/lib'
import { isHalloween } from 'shared/store/app/selectors/isHalloween'

const SIZE = 45
const COMPLAIN_DISAPPEAR_MS = 200000
const ComplainsOptions = [
	{
		value: ComplainType.earlier,
		label: 'Приехал раньше',
	},
	{
		value: ComplainType.later,
		label: 'Приехал позже',
	},
	{
		value: ComplainType.not_arrive,
		label: 'Не приехал',
	},
]

export const LeftToString: React.FC<{ left: ITime; busStop: StopKeys | null }> = ({ busStop, left }) => {
	const { t } = useTranslation()

	if (!busStop) return <SelectBusStopText />

	if (left.hours === null && left.minutes === null)
		return (
			<TextWrapper>
				{t('Bus on stop')} <b>{busStop}</b> {t('today wont arrive')}
			</TextWrapper>
		)

	return (
		<TextWrapper>
			{t('Next bus arriving in')}{' '}
			<HighLighted>
				{left.hours === 0 ? '' : `${left.hours}ч `}
				{left.minutes}м
			</HighLighted>
		</TextWrapper>
	)
}

interface ILeftProps {
	left: ITime
	busStop: StopKeys | null
	shouldShowFastReply: boolean
	holiday: IHoliday | null
	onComplain: (key: ComplainType) => void
}
const HowMuchLeft: React.FC<ILeftProps> = ({ left, busStop, shouldShowFastReply, holiday, onComplain }) => {
	const [isComplainClicked, setIsComplainClicked] = useState(false)
	const [activeComplain, setActiveComplain] = useState<ComplainType | undefined>(undefined)
	const isHalloweenMode = useTypedSelector(isHalloween)
	const isFancy = isHalloweenMode || !!holiday
	const [currentIcon, setIcon] = useState(isHalloweenMode ? Pumpkin : NextBus)
	const [iconClickCounter, setIconClickCounter] = useState(0)

	const getColorByLeftTime = () => {
		if (!left || left.hours === null || left.minutes === null || left?.hours >= 1) return '#e7edec'

		if (left.minutes > 15 && left.minutes < 35) return '#E4F5D6'
		if (left.minutes <= 15) return '#FBDCDC'

		return '#e7edec'
	}

	const handleFastReplyClick = (key: ComplainType) => {
		if (isComplainClicked) return

		setActiveComplain(key)
		onComplain(key)
		setIsComplainClicked(true)
	}

	const handleIconClick = () => {
		setIconClickCounter(prev => prev + 1)
	}

	useEffect(() => {
		if (!isHalloweenMode) return
		if (iconClickCounter > 18) return setIcon(Dead)

		if (iconClickCounter % 2 === 0) {
			setIcon(Pumpkin)
		} else {
			setIcon(EvilFace)
		}
	}, [iconClickCounter])

	useEffect(() => {
		if (isComplainClicked) {
			setTimeout(() => {
				setIsComplainClicked(false)
			}, COMPLAIN_DISAPPEAR_MS)
		}
	}, [isComplainClicked])

	return (
		<>
			<HowMuchLeftContainer isFancy={isFancy} defaultColor={getColorByLeftTime()}>
				<NextBusContainer>
					<ImageWrapper w={SIZE} h={SIZE}>
						<SVG
							src={currentIcon}
							width={SIZE}
							height={SIZE}
							uniquifyIDs={true}
							onClick={handleIconClick}
						/>
					</ImageWrapper>

					<BusEstimation>
						<LeftToString busStop={busStop} left={left} />
					</BusEstimation>
				</NextBusContainer>
			</HowMuchLeftContainer>

			{shouldShowFastReply && (
				<ComplainOptionContainer>
					<InlineOptions list={ComplainsOptions} onClick={handleFastReplyClick} activeId={activeComplain} />
				</ComplainOptionContainer>
			)}

			{holiday && <Holiday />}
		</>
	)
}

export default HowMuchLeft
