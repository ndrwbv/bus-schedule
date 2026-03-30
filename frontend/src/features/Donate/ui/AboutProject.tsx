import React, { useState } from 'react'
import { BottomSheet } from 'react-spring-bottom-sheet'
import { AndrewLytics } from 'shared/lib'
import { ContainerStyled, MiniButtonStyled } from 'shared/ui/common'
import { BottomSheetBgStyled } from 'shared/ui/MainLayout'

import { DonatePopup } from './DonatePopup'
import { AboutTextStyled, AboutTitleStyled, DonateCardStyled, DonateHeaderStyled, DonateTitleStyled } from './styled'

export const AboutProject: React.FC = () => {
	const [isAboutOpen, setIsAboutOpen] = useState(false)
	const [isDonateOpen, setIsDonateOpen] = useState(false)

	const handleOpenAbout = (): void => {
		setIsAboutOpen(true)
		AndrewLytics(`donate.openAbout`)
	}

	const handleDonate = (): void => {
		setIsAboutOpen(false)
		setIsDonateOpen(true)
		AndrewLytics(`donate.aboutDonate`)
	}

	return (
		<ContainerStyled>
			<DonateCardStyled>
				<DonateHeaderStyled>
					<DonateTitleStyled>О проекте</DonateTitleStyled>
					<MiniButtonStyled onClick={handleOpenAbout}>Подробнее</MiniButtonStyled>
				</DonateHeaderStyled>

				<BottomSheet
					open={isAboutOpen}
					onDismiss={() => setIsAboutOpen(false)}
					defaultSnap={({ maxHeight }) => maxHeight * 0.6}
					snapPoints={({ maxHeight }) => [maxHeight - maxHeight / 10, maxHeight * 0.6]}
				>
					<BottomSheetBgStyled $bg="#fff">
						<div style={{ padding: `20px 16px` }}>
							<AboutTitleStyled>О проекте</AboutTitleStyled>

							<AboutTextStyled>
								Привет! Меня зовут Андрей, я сделал этот сайт потому что сам жду 112С на остановке и
								устал смотреть расписание в таблицах.
							</AboutTextStyled>

							<AboutTextStyled>
								Проект поддерживается одним человеком в свободное время. Если сервис полезен — скинь на
								кофе, будет мотивация делать дальше ☕
							</AboutTextStyled>

							<MiniButtonStyled onClick={handleDonate}>Поддержать проект</MiniButtonStyled>
						</div>
					</BottomSheetBgStyled>
				</BottomSheet>

				<DonatePopup isOpen={isDonateOpen} onClose={() => setIsDonateOpen(false)} />
			</DonateCardStyled>
		</ContainerStyled>
	)
}
