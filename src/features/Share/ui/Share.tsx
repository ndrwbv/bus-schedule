import { useEffect, useRef, useState } from 'react'
import SVG from 'react-inlinesvg'
import QRCode from 'react-qr-code'
import { BottomSheet, BottomSheetRef } from 'react-spring-bottom-sheet'
import { AndrewLytics } from 'shared/lib'
import { PopupContent } from 'shared/ui/Popup/PopupContent'

import { copyTextToClipboard } from '../helpers/clickToClipBoard'
import CopyIcon from '../img/copy-icon.svg'
import QRCodeIcon from '../img/qr-code-icon.svg'
import {
	CopyFieldStyled,
	QRCodeContainerStyled,
	ShareContainerStyled,
	ShareItemContainerStyled,
	ShareTitleStyled,
} from './styled'

export const Share: React.FC = () => {
	const [isOpen, setIsOpen] = useState(false)
	const [clicked, setClicked] = useState(false)
	const focusRef = useRef<HTMLButtonElement>(null)
	const sheetRef = useRef<BottomSheetRef>(null)

	const handleClick = (): void => {
		copyTextToClipboard(`https://severbus.ru?utm=share`)
		setClicked(true)
		AndrewLytics(`shareClick`)
	}

	const handleOpenClick = (): void => {
		setIsOpen(true)
		AndrewLytics(`shareOpen`)
	}

	useEffect(() => {
		setClicked(false)
	}, [isOpen])

	return (
		<>
			<BottomSheet ref={sheetRef} initialFocusRef={focusRef} open={isOpen} onDismiss={() => setIsOpen(false)}>
				<PopupContent>
					<ShareItemContainerStyled>
						<ShareTitleStyled>Поделиться расписанием</ShareTitleStyled>
					</ShareItemContainerStyled>

					<ShareItemContainerStyled>
						<QRCodeContainerStyled>
							<QRCode size={166} value="https://severbus.ru?utm=scan" bgColor="#F2F4F4" />
						</QRCodeContainerStyled>
					</ShareItemContainerStyled>

					<ShareItemContainerStyled>
						<CopyFieldStyled onClick={handleClick} clicked={clicked}>
							<p>https://severbus.ru</p>
							<SVG src={CopyIcon} width={20} height={20} uniquifyIDs style={{ display: `flex` }} />
						</CopyFieldStyled>
					</ShareItemContainerStyled>
				</PopupContent>
			</BottomSheet>

			<ShareContainerStyled onClick={handleOpenClick}>
				<SVG src={QRCodeIcon} width={20} height={20} uniquifyIDs style={{ display: `flex` }} />
			</ShareContainerStyled>
		</>
	)
}
