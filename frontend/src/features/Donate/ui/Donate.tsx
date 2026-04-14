import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { AndrewLytics } from 'shared/lib'
import { ContainerStyled } from 'shared/ui/common'
import { Modal } from 'shared/ui/Modal'

import { DonateBanner } from './DonateBanner'
import {
	AboutBlockArrowStyled,
	AboutBlockEmojiStyled,
	AboutBlockLeftStyled,
	AboutBlockStyled,
	AboutBlockSubStyled,
	AboutBlockTextStyled,
	AboutBlockTitleStyled,
	CopiedTooltipStyled,
	CopyButtonStyled,
	DonatePhoneNameStyled,
	DonatePhoneRowStyled,
	DonatePhoneStyled,
	ModalFooterStyled,
	ModalTextStyled,
} from './styled'

const PHONE = `+79969386490`
const PHONE_DISPLAY = `+7 996 938-64-90`

const DonateContext = createContext<{ open: () => void }>({ open: () => {} })

export const useDonate = (): { open: () => void } => useContext(DonateContext)

export const DonateCard: React.FC = () => {
	const { open } = useContext(DonateContext)

	return (
		<ContainerStyled>
			<AboutBlockStyled onClick={open}>
				<AboutBlockLeftStyled>
					<AboutBlockEmojiStyled>☕</AboutBlockEmojiStyled>
					<AboutBlockTextStyled>
						<AboutBlockTitleStyled>О проекте</AboutBlockTitleStyled>
						<AboutBlockSubStyled>Поддержать разработчика</AboutBlockSubStyled>
					</AboutBlockTextStyled>
				</AboutBlockLeftStyled>
				<AboutBlockArrowStyled>›</AboutBlockArrowStyled>
			</AboutBlockStyled>
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
				<Modal title="О проекте" onClose={handleClose}>
					<ModalTextStyled>
						Привет! Меня зовут Андрей. Этот сайт я сделал для жителей района, чтобы было проще
						ориентироваться в расписании 112С.
						<br />
						<br />
						Если сервис полезен — буду признателен донату, который пойдет на оплату хостинга, домена или
						напитка с пеной)
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
				</Modal>
			)}
		</DonateContext.Provider>
	)
}
