import React, { useMemo, useState } from 'react'
import { AndrewLytics } from 'shared/lib'
import { CardStyled, ContainerStyled, MiniButtonStyled } from 'shared/ui/common'
import { HeaderTextStyled } from 'shared/ui/Header/styled'
import { BottomSheetBgStyled } from 'shared/ui/MainLayout'
import { Drawer } from 'vaul'

import { PopupContentStyled } from '../../../shared/ui/Popup/PopupContent'
import { getHumanDate } from '../helpers'
import { useComplainsContext } from '../model/ComplainsContext'
import styles from './complains.module.css'
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

	const { complains: allComplains } = useComplainsContext()

	const complains = useMemo(() => allComplains.filter(c => c.type !== `arrived`), [allComplains])

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
				<Drawer.Root open={isOpen} onOpenChange={setIsOpen}>
					<Drawer.Portal>
						<Drawer.Overlay className={styles.overlay} />
						<Drawer.Content className={styles.content}>
							<div className={styles.handleArea}>
								<div className={styles.handle} />
							</div>
							<div className={styles.scrollArea}>
								<BottomSheetBgStyled $bg="#fff">
									<PopupContentStyled>
										<InfoTextStyled>
											Жалобы попадают автоматически после выбора опции «Приехал раньше» или
											«Приехал позже». Кнопки появляются в секции «Остановка» при выбранной
											остановке.
										</InfoTextStyled>
										{complains.map(c => (
											<ComplainsMessage {...c} key={c.id} />
										))}
									</PopupContentStyled>
								</BottomSheetBgStyled>
							</div>
						</Drawer.Content>
					</Drawer.Portal>
				</Drawer.Root>

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
