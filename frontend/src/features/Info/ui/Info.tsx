import React, { useEffect, useState } from 'react'
import SVG from 'react-inlinesvg'
import { AndrewLytics } from 'shared/lib'
import { ContainerStyled } from 'shared/ui/common'

import InfoCloseCross from '../img/infoclosecross.svg'
import { useGetInfoQuery } from '../model/info'
import { InfoCloseButtonStyled, InfoLinkStyled, InfoTextStyled, InfoWrapperStyled } from './styled'

export const Info: React.FC = () => {
	const [isInfoShow, setIsInfoShow] = useState(false)
	const { data: infoMessage } = useGetInfoQuery()

	const onLinkClick = (): void => {
		AndrewLytics(`infoBlockLinkClick`)
	}

	const onInfoCrossClick = (): void => {
		setIsInfoShow(false)
		if (infoMessage?.id) {
			localStorage.setItem(`infoMessageId`, String(infoMessage.id))
		}

		AndrewLytics(`infoBlockHide`)
	}

	useEffect(() => {
		if (!infoMessage?.id) return

		const infoMessageId = localStorage.getItem(`infoMessageId`)
		if (Number(infoMessageId) !== Number(infoMessage.id)) setIsInfoShow(true)
	}, [infoMessage])

	if (!infoMessage || !isInfoShow) return null

	const { message: text, link } = infoMessage

	return (
		<ContainerStyled>
			<InfoWrapperStyled>
				{link ? (
					<InfoLinkStyled href={link} target="_blank" onClick={onLinkClick}>
						{text}
					</InfoLinkStyled>
				) : (
					<InfoTextStyled>{text}</InfoTextStyled>
				)}
				<InfoCloseButtonStyled data-testid="hide-btn" onClick={onInfoCrossClick}>
					<SVG className="closebutton" src={InfoCloseCross} />
				</InfoCloseButtonStyled>
			</InfoWrapperStyled>
		</ContainerStyled>
	)
}
