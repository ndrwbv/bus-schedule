import SVG from 'react-inlinesvg'
import InfoCloseCross from 'img/infoclosecross.svg'
import { InfoWrapper, InfoLink, InfoText, InfoCloseButton } from './styled'

const Info: React.FC<{
	onLinkClick: () => void
	text: string | null
	link: string | null
	onInfoCrossClick: () => void
}> = ({ onLinkClick, onInfoCrossClick, text, link }) => {
	if (!text) return null

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
