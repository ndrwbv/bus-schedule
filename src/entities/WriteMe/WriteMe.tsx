import { useTranslation } from 'react-i18next'
import SVG from 'react-inlinesvg'
import { TelegramButton } from 'shared/ui'
import { CardHeaderStyled, CardStyled } from 'shared/ui/common'

import Write from './img/write.svg'
import { HandWrapperStyled } from './styled'

export const WriteMe: React.FC = () => {
	const { t } = useTranslation()

	return (
		<CardStyled isOverflow>
			<CardHeaderStyled>
				{t(`Did you see an error?`)}
				<br />
				{t(`Have a suggestion for improvement?`)}
			</CardHeaderStyled>

			<TelegramButton />

			<HandWrapperStyled>
				<SVG src={Write} width={109} height={100} uniquifyIDs />
			</HandWrapperStyled>
		</CardStyled>
	)
}
