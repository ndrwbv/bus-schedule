import SVG from 'react-inlinesvg'
import InfoCloseCross from 'img/infoclosecross.svg'
import { InfoWrapper, InfoLink, InfoText, InfoCloseButton } from './styled'
import { AndrewLytics } from 'helpers/analytics'
import React from 'react'
import useInfo from 'hooks/useInfo'

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
		<InfoWrapper>
			{link ? (
				<InfoLink href={link} target="_blank" onClick={onLinkClick}>
					{text}
				</InfoLink>
			) : (
				<InfoText>{text}</InfoText>
			)}
			<InfoCloseButton data-testid="hide-btn" onClick={onInfoCrossClick}>
				<SVG className="closebutton" src={InfoCloseCross}  />
			</InfoCloseButton>
		</InfoWrapper>
	)
}

export default Info
