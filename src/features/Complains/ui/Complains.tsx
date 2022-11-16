import React, { useMemo, useState } from 'react'
import ComplainMessage from './ComplainsMessage'
import ComplainsProvider, { useComplainsContext } from '../model/ComplainsContext'
import { Card, Container, MiniButton } from 'shared/ui/common'

import { HeaderText } from 'shared/ui/Header/styled'
import { getHumanDate } from '../helpers'
import { AndrewLytics } from 'shared/lib'
import {
	ComplainCount,
	ComplainsBlockContainer,
	ComplainsBlockText,
	ComplainsContainer,
	ComplainsLabel,
	InfoText,
} from './styled'
import { PopupContent } from "../../../shared/ui/Popup/PopupContent"
import { BottomSheet } from 'react-spring-bottom-sheet'

export const Complains = () => (
	<ComplainsProvider>
		<ComplainsConent />
	</ComplainsProvider>
)

function ComplainsConent() {
	const [isOpen, setIsOpen] = useState(false)

	const { complains } = useComplainsContext()

	const latestTime = useMemo(() => {
		if (complains.length === 0) return 'сегодня ни одной жалобы'
		const latest = complains[0]
		return `последняя ${getHumanDate(latest.date)}`
	}, [complains])

	const handleOpenComplains = () => {
		setIsOpen(true)
		AndrewLytics('openComplains')
	}

	return (
		<Container>
			<Card>
				<BottomSheet
					open={isOpen}
					onDismiss={() => setIsOpen(false)}
					defaultSnap={({ maxHeight }) => maxHeight / 2}
					snapPoints={({ maxHeight }) => [maxHeight - maxHeight / 10, maxHeight / 4, maxHeight * 0.6]}
				>
					<PopupContent>
						<InfoText>
							Жалобы попадают автоматически после выбора опции «Приехал раньше» или «Приехал позже».
							Кнопки появлюятся в секции Остановка при выбранной остановке.
						</InfoText>
						{complains.map(c => (
							<ComplainMessage {...c} key={c.id} />
						))}
					</PopupContent>
				</BottomSheet>

				<ComplainsContainer>
					<div>
						<ComplainsBlockContainer>
							<ComplainsBlockText>
								Жалобы <ComplainCount>{complains.length}</ComplainCount>
							</ComplainsBlockText>
							<ComplainsLabel>{latestTime}</ComplainsLabel>
						</ComplainsBlockContainer>

						<HeaderText></HeaderText>
					</div>

					<MiniButton disabled={complains.length === 0} onClick={handleOpenComplains}>
						Смотреть
					</MiniButton>
				</ComplainsContainer>
			</Card>
		</Container>
	)
}
