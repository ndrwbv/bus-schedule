import SVG from 'react-inlinesvg'

import TelegramLogo from 'img/telegram-logo.svg'
import { ImageWrapper } from '../ImageWrapper'
import { TelegramContainer, TelegramText } from './styled'

const TelegramButton = () => {
	return (
		<a href="https://t.me/ndrwbv" target="_blank" rel="noreferrer">
			<TelegramContainer>
				<ImageWrapper w={20} h={20}>
					<SVG src={TelegramLogo} width={20} height={20} title="Menu" uniquifyIDs={true} />
				</ImageWrapper>

				<TelegramText>Написать в телеграм</TelegramText>
			</TelegramContainer>
		</a>
	)
}

export default TelegramButton
