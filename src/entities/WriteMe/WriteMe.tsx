import { useTranslation } from 'react-i18next'
import SVG from 'react-inlinesvg'
import { TelegramButton } from 'shared/ui'
import { Card, CardHeader } from 'shared/ui/common'

import Write from './img/write.svg'
import { HandWrapperStyled } from './styled'

export const WriteMe: React.FC = () => {
	const { t } = useTranslation()

	return (
		<Card isOverflow>
			<CardHeader>
				{t(`Did you see an error?`)}
				<br />
				{t(`Have a suggestion for improvement?`)}
			</CardHeader>

			<TelegramButton />

			<HandWrapperStyled>
				<SVG src={Write} width={109} height={100} uniquifyIDs />
			</HandWrapperStyled>
		</Card>
	)
}
