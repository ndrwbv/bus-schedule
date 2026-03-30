import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { BottomSheet } from 'react-spring-bottom-sheet'
import { AndrewLytics } from 'shared/lib'
import { ContainerStyled, MiniButtonStyled } from 'shared/ui/common'
import { BottomSheetBgStyled } from 'shared/ui/MainLayout'

import { DonateBanner } from './DonateBanner'
import {
	AboutTextStyled,
	AboutTitleStyled,
	CopiedTooltipStyled,
	CopyButtonStyled,
	DonateCardStyled,
	DonateHeaderStyled,
	DonatePhoneNameStyled,
	DonatePhoneRowStyled,
	DonatePhoneStyled,
	DonatePopupFooterStyled,
	DonateTitleStyled,
} from './styled'

const PHONE = `+79969386490`
const PHONE_DISPLAY = `+7 996 938-64-90`

const DonateContext = createContext<{ open: () => void }>({ open: () => {} })

export const DonateCard: React.FC = () => {
	const { open } = useContext(DonateContext)

	return (
		<ContainerStyled>
			<DonateCardStyled>
				<DonateHeaderStyled>
					<DonateTitleStyled>О проекте</DonateTitleStyled>
					<MiniButtonStyled onClick={open}>Подробнее</MiniButtonStyled>
				</DonateHeaderStyled>
			</DonateCardStyled>
		</ContainerStyled>
	)
}

export const DonateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [isOpen, setIsOpen] = useState(false)
	const [copied, setCopied] = useState(false)

	const handleOpen = useCallback((): void => {
		setIsOpen(true)
		AndrewLytics(`donate.openAbout`)
	}, [])

	const handleCopy = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(PHONE)
			setCopied(true)
			AndrewLytics(`donate.copyPhone`)
			setTimeout(() => setCopied(false), 2000)
		} catch {
			// fallback
		}
	}, [])

	const ctx = useMemo(() => ({ open: handleOpen }), [handleOpen])

	return (
		<DonateContext.Provider value={ctx}>
			{children}

			<DonateBanner onDonate={handleOpen} />

			<BottomSheet
				open={isOpen}
				onDismiss={() => setIsOpen(false)}
				defaultSnap={({ maxHeight }) => maxHeight * 0.7}
				snapPoints={({ maxHeight }) => [maxHeight - maxHeight / 10, maxHeight * 0.7]}
			>
				<BottomSheetBgStyled $bg="#fff">
					<div style={{ padding: `20px 16px` }}>
						<AboutTitleStyled>О проекте</AboutTitleStyled>

						<AboutTextStyled>
							Привет! Меня зовут Андрей, я сделал этот сайт потому что сам жду 112С на остановке и устал
							смотреть расписание в таблицах.
						</AboutTextStyled>

						<AboutTextStyled>
							Проект поддерживается одним человеком в свободное время. Если сервис полезен — скинь на
							напиток с пеной, будет мотивация делать дальше 🍺
						</AboutTextStyled>

						<DonatePhoneRowStyled>
							<div>
								<DonatePhoneStyled>{PHONE_DISPLAY}</DonatePhoneStyled>
								<br />
								<DonatePhoneNameStyled>Андрей · Т-Банк</DonatePhoneNameStyled>
							</div>
							<CopyButtonStyled onClick={handleCopy} title="Скопировать номер">
								{copied ? <CopiedTooltipStyled>Скопировано!</CopiedTooltipStyled> : `📋`}
							</CopyButtonStyled>
						</DonatePhoneRowStyled>

						<DonatePopupFooterStyled>Спасибо! ❤️</DonatePopupFooterStyled>
					</div>
				</BottomSheetBgStyled>
			</BottomSheet>
		</DonateContext.Provider>
	)
}
