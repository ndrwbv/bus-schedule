import { useEffect, useState } from 'react'
import SVG from 'react-inlinesvg'
import QRCode from 'react-qr-code'

import QRCodeIcon from '../img/qr-code-icon.svg'
import CopyIcon from '../img/copy-icon.svg'

import { copyTextToClipboard } from '../helpers/clickToClipBoard'

import { AndrewLytics } from 'shared/lib'

import { CopyField, QRCodeContainer, ShareContainer, ShareItemContainer, ShareTitle } from './styled'
import { BottomSheet } from 'react-spring-bottom-sheet'

export const Share = () => {
	const [isOpen, setIsOpen] = useState(false)
	const [clicked, setClicked] = useState(false)

	const handleClick = () => {
		copyTextToClipboard('https://severbus.ru?utm=share')
		setClicked(true)
		AndrewLytics('shareClick')
	}

	const handleOpenClick = () => {
		setIsOpen(true)
		AndrewLytics('shareOpen')
	}

	useEffect(() => {
		setClicked(false)
	}, [isOpen])

	return (
		<>
			<BottomSheet open={isOpen} onDismiss={() => setIsOpen(false)}>
				<ShareItemContainer>
					<ShareTitle>Поделиться расписанием</ShareTitle>
				</ShareItemContainer>

				<ShareItemContainer>
					<QRCodeContainer>
						<QRCode size={166} value="https://severbus.ru?utm=scan" bgColor="#F2F4F4" />
					</QRCodeContainer>
				</ShareItemContainer>

				<ShareItemContainer>
					<CopyField onClick={handleClick} clicked={clicked}>
						<p>https://severbus.ru</p>
						<SVG src={CopyIcon} width={20} height={20} uniquifyIDs={true} style={{ display: 'flex' }} />
					</CopyField>
				</ShareItemContainer>
			</BottomSheet>

			<ShareContainer onClick={handleOpenClick}>
				<SVG src={QRCodeIcon} width={20} height={20} uniquifyIDs={true} style={{ display: 'flex' }} />
			</ShareContainer>
		</>
	)
}
