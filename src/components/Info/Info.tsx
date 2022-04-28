import SVG from 'react-inlinesvg'
import React from 'react'

import InfoCloseCross from 'img/infoclosecross.svg'
import { AndrewLytics } from 'helpers/analytics'
import useInfo from 'hooks/useInfo'
import { Container } from 'components/common'
import { InfoWrapper, InfoLink, InfoText, InfoCloseButton } from './styled'

const Info: React.FC = () => {
	const [isInfoShow, setIsInfoShow] = React.useState(false)
	const infoMessage = useInfo()
	const { message: text, link } = infoMessage

	const onLinkClick = () => {
		AndrewLytics('infoBlockLinkClick')
	}

	const onInfoCrossClick = () => {
		setIsInfoShow(false)
		infoMessage.id && localStorage.setItem('infoMessageId', String(infoMessage.id))

		AndrewLytics('infoBlockHide')
	}

	React.useEffect(() => {
		if (!infoMessage.id) return

		const _infoMessageId = localStorage.getItem('infoMessageId')
		Number(_infoMessageId) !== Number(infoMessage.id) && setIsInfoShow(true)
	}, [infoMessage.id])

	if (!text || !isInfoShow) return null

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

export default Info
