import SVG from 'react-inlinesvg'
import InfoCloseCross from 'img/infoclosecross.svg'
import { InfoWrapper, InfoLink, InfoText, InfoCloseButton } from './styled'
import { AndrewLytics } from 'helpers/analytics'
import React from 'react'
import useInfo from 'hooks/useInfo'
import { FetchInfoResponse } from 'api/info'

const Info: React.FC<{
	fetchInfo: () => FetchInfoResponse
}> = ({ fetchInfo }) => {
	const [isInfoShow, setIsInfoShow] = React.useState(false)
	const infoMessage = useInfo(fetchInfo)
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
			<InfoCloseButton>
				<SVG className="closebutton" src={InfoCloseCross} onClick={onInfoCrossClick} />
			</InfoCloseButton>
		</InfoWrapper>
	)
}

export default Info
