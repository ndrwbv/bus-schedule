import React, { useCallback, useState } from 'react'
import { BottomSheet } from 'react-spring-bottom-sheet'
import { AndrewLytics } from 'shared/lib'
import { BottomSheetBgStyled } from 'shared/ui/MainLayout'

import {
	CopiedTooltipStyled,
	CopyButtonStyled,
	DonatePhoneNameStyled,
	DonatePhoneRowStyled,
	DonatePhoneStyled,
	DonatePopupContentStyled,
	DonatePopupFooterStyled,
	DonatePopupTextStyled,
	DonatePopupTitleStyled,
} from './styled'

const PHONE = `+79969386490`
const PHONE_DISPLAY = `+7 996 938-64-90`

interface DonatePopupProps {
	isOpen: boolean
	onClose: () => void
}

export const DonatePopup: React.FC<DonatePopupProps> = ({ isOpen, onClose }) => {
	const [copied, setCopied] = useState(false)

	const handleCopy = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(PHONE)
			setCopied(true)
			AndrewLytics(`donate.copyPhone`)
			setTimeout(() => setCopied(false), 2000)
		} catch {
			// fallback: do nothing
		}
	}, [])

	return (
		<BottomSheet
			open={isOpen}
			onDismiss={onClose}
			defaultSnap={({ maxHeight }) => maxHeight * 0.6}
			snapPoints={({ maxHeight }) => [maxHeight - maxHeight / 10, maxHeight * 0.6]}
		>
			<BottomSheetBgStyled $bg="#fff">
				<DonatePopupContentStyled>
					<DonatePopupTitleStyled>Поддержать severbus.ru</DonatePopupTitleStyled>

					<DonatePopupTextStyled>
						Привет! Меня зовут Андрей. Я сам езжу на 112С и сделал этот сайт чтобы было удобнее.
						<br />
						<br />
						Проект поддерживается одним человеком — хостинг, домен, разработка. Скинь на напиток с пеной,
						будет мотивация делать дальше 🍺
					</DonatePopupTextStyled>

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
				</DonatePopupContentStyled>
			</BottomSheetBgStyled>
		</BottomSheet>
	)
}
