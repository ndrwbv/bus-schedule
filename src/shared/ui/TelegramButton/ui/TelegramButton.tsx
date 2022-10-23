import SVG from 'react-inlinesvg'
import { useTranslation } from 'react-i18next'

<<<<<<< HEAD:src/components/TelegramButton/TelegramButton.tsx
import TelegramLogo from 'img/telegram-logo.svg'
import { ImageWrapper } from '../ImageWrapper'
=======
import TelegramLogo from '../img/telegram-logo.svg'
import { ImageWrapper } from 'shared/ui/ImageWrapper'
>>>>>>> cff00f8 (moves shared):src/shared/ui/TelegramButton/ui/TelegramButton.tsx

import { TelegramContainer, TelegramText } from './styled'
import { TG_LINK } from 'shared/common'

export const TelegramButton = () => {
	const { t } = useTranslation()

	return (
		<a href={TG_LINK} target="_blank" rel="noreferrer">
			<TelegramContainer>
				<ImageWrapper w={20} h={20}>
					<SVG src={TelegramLogo} width={20} height={20} title="Menu" uniquifyIDs={true} />
				</ImageWrapper>

				<TelegramText>{t('Contact in telegram')}</TelegramText>
			</TelegramContainer>
		</a>
	)
}
