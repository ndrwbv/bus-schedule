import { useScheduleContext } from 'widget/Schedule/model/ScheduleContext'
import { useTranslation } from 'react-i18next'
import SVG from 'react-inlinesvg'
import Web from '../img/web.svg'

import { Card, Container, ImageWrapper } from 'shared/ui'
import {
	DirectionContainer,
	DirectionPlaceholder,
	DirectionText,
	GoButton,
	GoButtonContainer,
	WebWrapper,
} from './styled'
import { useTypedSelector } from 'shared/lib'
import { isHalloween } from 'App/model/selectors/isHalloween'
import { useState } from 'react'

const SIZE = 43
export const DirectionChanger = () => {
	const { direction, handleChangeDirection } = useScheduleContext()
	const isHalloweenMode = useTypedSelector(isHalloween)
	const { t } = useTranslation()

	const [isWebVisible, setIsWebVisible] = useState(true)
	const handleWebClick = () => {
		setIsWebVisible(false)
	}

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

					<GoButton
						active={direction === 'in'}
						onClick={() => handleChangeDirection(direction === 'in' ? 'out' : 'in')}
					>
						{direction === 'in' ? t('Out of north park') : t('In north park')}
					</GoButton>
				</GoButtonContainer>
			</Card>
		</Container>
	)
}
