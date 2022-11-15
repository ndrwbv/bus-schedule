import SVG from 'react-inlinesvg'
import React, { useEffect, useState } from 'react'

import InfoCloseCross from '../img/infoclosecross.svg'
import { AndrewLytics } from 'shared/lib'
import { Container } from 'shared/ui/common'
import { InfoWrapper, InfoLink, InfoText, InfoCloseButton } from './styled'
import { useGetInfoQuery } from '../model/info'

export const Info: React.FC = () => {
	const [isInfoShow, setIsInfoShow] = useState(false)
	const { data: infoMessage } = useGetInfoQuery()

	const onLinkClick = () => {
		AndrewLytics('infoBlockLinkClick')
	}

	const onInfoCrossClick = () => {
		setIsInfoShow(false)
		infoMessage?.id && localStorage.setItem('infoMessageId', String(infoMessage.id))

		AndrewLytics('infoBlockHide')
	}

	useEffect(() => {
		if (!infoMessage?.id) return

		const _infoMessageId = localStorage.getItem('infoMessageId')
		Number(_infoMessageId) !== Number(infoMessage.id) && setIsInfoShow(true)
	}, [infoMessage])

	if (!infoMessage || !isInfoShow) return null

	const { message: text, link } = infoMessage

	return (
		<Container>
			<InfoWrapper>
				{link ? (
					<InfoLink href={link} target="_blank" onClick={onLinkClick}>
						{text}
					</InfoLink>
				) : (
					<InfoText>{text}</InfoText>
				)}
				<InfoCloseButton data-testid="hide-btn" onClick={onInfoCrossClick}>
					<SVG className="closebutton" src={InfoCloseCross} />
				</InfoCloseButton>
			</InfoWrapper>
		</Container>
	)
}
