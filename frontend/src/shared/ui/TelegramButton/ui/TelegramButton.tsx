import { useTranslation } from 'react-i18next'
import SVG from 'react-inlinesvg'
import { TG_LINK } from 'shared/common'
import { ImageWrapperStyled } from 'shared/ui/ImageWrapper'

import TelegramLogo from '../img/telegram-logo.svg'
import { TelegramContainerStyled, TelegramTextStyled } from './styled'

export const TelegramButton: React.FC = () => {
	const { t } = useTranslation()

	return (
		<a href={TG_LINK} target="_blank" rel="noreferrer">
			<TelegramContainerStyled>
				<ImageWrapperStyled $w={20} $h={20}>
					<SVG src={TelegramLogo} width={20} height={20} title="Menu" uniquifyIDs />
				</ImageWrapperStyled>

				<TelegramTextStyled>{t(`Contact in telegram`)}</TelegramTextStyled>
			</TelegramContainerStyled>
		</a>
	)
}
