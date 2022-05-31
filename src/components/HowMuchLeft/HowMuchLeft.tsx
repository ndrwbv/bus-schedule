import React, { useState } from 'react'
import SVG from 'react-inlinesvg'
import { useTranslation } from 'react-i18next'

import { ITime } from 'interfaces/ITime'
import { StopKeys } from 'interfaces/Stops'
import NextBus from 'img/next-bus.svg'

import { ImageWrapper } from '../ImageWrapper'
import SelectBusStopText from '../SelectBusStopText'

import Holiday from 'components/Holiday/Holiday'
import { IHoliday } from 'interfaces/IHolidays'
import { AddToFavoriteButton } from '../Schedule/styled'

import { BusEstimation, HighLighted, HowMuchLeftContainer, NextBusContainer, TextWrapper } from './styled'

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

const HowMuchLeft: React.FC<{
	left: ITime
	busStop: StopKeys | null
	shouldShowFastReply: boolean
	holiday: IHoliday | null
	onComplain: () => void
}> = ({ left, busStop, shouldShowFastReply, holiday, onComplain }) => {
	const [isComplainClicked, setIsComplainClicked] = useState(false)

	const getColorByLeftTime = () => {
		if (!left || left.hours === null || left.minutes === null || left?.hours >= 1) return '#e7edec'

		if (left.minutes > 15 && left.minutes < 35) return '#E4F5D6'
		if (left.minutes <= 15) return '#FBDCDC'

		return '#e7edec'
	}

	const handleClick = () => {
		onComplain()
		setIsComplainClicked(true)
	}

	return (
		<>
			<HowMuchLeftContainer isFancy={!!holiday} defaultColor={getColorByLeftTime()}>
				<NextBusContainer>
					<ImageWrapper w={39} h={39}>
						<SVG src={NextBus} width={39} height={39} uniquifyIDs={true} />
					</ImageWrapper>

					<BusEstimation>
						<LeftToString busStop={busStop} left={left} />
					</BusEstimation>
				</NextBusContainer>
			</HowMuchLeftContainer>

			{shouldShowFastReply && (
				<AddToFavoriteButton status="add" mt="12px" onClick={handleClick} disabled={isComplainClicked}>
					{isComplainClicked ? 'Спасибо за ответ!' : 'Я сел в автобус'}
				</AddToFavoriteButton>
			)}

			{holiday && <Holiday />}
		</>
	)
}

export default HowMuchLeft
