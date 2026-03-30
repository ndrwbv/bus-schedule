import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { AndrewLytics } from 'shared/lib'
import { ContainerStyled, MiniButtonStyled } from 'shared/ui/common'

import { DonateBanner } from './DonateBanner'
import {
	CopiedTooltipStyled,
	CopyButtonStyled,
	DonateCardStyled,
	DonateHeaderStyled,
	DonatePhoneNameStyled,
	DonatePhoneRowStyled,
	DonatePhoneStyled,
	DonateTitleStyled,
	ModalCloseStyled,
	ModalContentStyled,
	ModalFooterStyled,
	ModalOverlayStyled,
	ModalTextStyled,
	ModalTitleStyled,
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

	const handleClose = useCallback((): void => {
		setIsOpen(false)
	}, [])

	const handleOverlayClick = useCallback(
		(e: React.MouseEvent) => {
			if (e.target === e.currentTarget) handleClose()
		},
		[handleClose],
	)

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

			{isOpen && (
				<ModalOverlayStyled onClick={handleOverlayClick}>
					<ModalContentStyled>
						<ModalCloseStyled onClick={handleClose} aria-label="Закрыть">
							✕
						</ModalCloseStyled>

						<ModalTitleStyled>О проекте</ModalTitleStyled>

						<ModalTextStyled>
							Привет! Меня зовут Андрей. Этот сайт я сделал для жителей района, чтобы было проще
							ориентироваться в расписании 112С.
							<br />
							<br />
							Если сервис полезен — скинь на напиток с пеной, будет мотивация делать дальше 🍺
						</ModalTextStyled>

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

						<ModalFooterStyled>Спасибо! ❤️</ModalFooterStyled>
					</ModalContentStyled>
				</ModalOverlayStyled>
			)}
		</DonateContext.Provider>
	)
}
