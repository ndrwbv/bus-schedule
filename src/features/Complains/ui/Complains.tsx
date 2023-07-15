import React, { useMemo, useState } from 'react'
import { BottomSheet } from 'react-spring-bottom-sheet'
import { AndrewLytics } from 'shared/lib'
import { CardStyled, ContainerStyled, MiniButtonStyled } from 'shared/ui/common'
import { HeaderTextStyled } from 'shared/ui/Header/styled'
import { BottomSheetBgStyled } from 'shared/ui/MainLayout'

import { PopupContentStyled } from '../../../shared/ui/Popup/PopupContent'
import { getHumanDate } from '../helpers'
import { useComplainsContext } from '../model/ComplainsContext'
import { ComplainsMessage } from './ComplainsMessage'
import {
	ComplainCountStyled,
	ComplainsBlockContainerStyled,
	ComplainsBlockTextStyled,
	ComplainsContainerStyled,
	ComplainsLabelStyled,
	InfoTextStyled,
} from './styled'

export const Complains: React.FC = () => {
	const [isOpen, setIsOpen] = useState(false)

	const { complains } = useComplainsContext()

	const latestTime = useMemo(() => {
		if (complains.length === 0) return `сегодня ни одной жалобы`
		const latest = complains[0]

		const humanDate = getHumanDate(latest.date)

		return `последняя ${humanDate}`
	}, [complains])

	const handleOpenComplains = (): void => {
		setIsOpen(true)
		AndrewLytics(`openComplains`)
	}

	return (
		<ContainerStyled>
			<CardStyled>
				<BottomSheet
					open={isOpen}
					onDismiss={() => setIsOpen(false)}
					defaultSnap={({ maxHeight }) => maxHeight / 2}
					snapPoints={({ maxHeight }) => [maxHeight - maxHeight / 10, maxHeight / 4, maxHeight * 0.6]}
				>
					<BottomSheetBgStyled $bg="#fff">
						<PopupContentStyled>
							<InfoTextStyled>
								Жалобы попадают автоматически после выбора опции «Приехал раньше» или «Приехал позже».
								Кнопки появляются в секции «Остановка» при выбранной остановке.
							</InfoTextStyled>
							{complains.map(c => (
								<ComplainsMessage {...c} key={c.id} />
							))}
						</PopupContentStyled>
					</BottomSheetBgStyled>
				</BottomSheet>

				<ComplainsContainerStyled>
					<div>
						<ComplainsBlockContainerStyled>
							<ComplainsBlockTextStyled>
								Жалобы <ComplainCountStyled>{complains.length}</ComplainCountStyled>
							</ComplainsBlockTextStyled>
							<ComplainsLabelStyled>{latestTime}</ComplainsLabelStyled>
						</ComplainsBlockContainerStyled>

						<HeaderTextStyled />
					</div>

					<MiniButtonStyled disabled={complains.length === 0} onClick={handleOpenComplains}>
						Смотреть
					</MiniButtonStyled>
				</ComplainsContainerStyled>
			</CardStyled>
		</ContainerStyled>
	)
}
