import { TRANSLATION_LINK } from 'shared/common'
import { AndrewLytics } from 'shared/lib'
import { ContainerStyled } from 'shared/ui'
import styled from 'styled-components'

export const TranslationLinkStyled = styled.a`
	position: relative;
	display: block;
	color: black;
	text-decoration: underline;
	padding-left: 18px;
	margin: 16px 0;

	&::before {
		content: '';
		position: absolute;
		left: 3px;
		top: 5px;
		width: 8px;
		height: 8px;
		background-color: #ff0000;
		border-radius: 50%;
	}
`

export const TranslationLink: React.FC = () => {
	return (
		<ContainerStyled>
			<TranslationLinkStyled
				href={TRANSLATION_LINK}
				target="_blank"
				onClick={() => AndrewLytics(`clickTranslation`)}
			>
				Онлайн трансляция с моста
			</TranslationLinkStyled>
		</ContainerStyled>
	)
}
