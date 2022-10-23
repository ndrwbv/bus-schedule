import SVG from 'react-inlinesvg'

import { Card, CardHeader } from 'shared/ui/common'

import Write from './img/write.svg'
import { TelegramButton } from 'shared/ui'
import { useTranslation } from 'react-i18next'
import { HandWrapper } from './styled'

const WriteMe = () => {
	const { t } = useTranslation()

	return (
		<Card isOverflow>
			<CardHeader>
				{t('Did you see an error?')}
				<br />
				{t('Have a suggestion for improvement?')}
			</CardHeader>

			<TelegramButton />

			<HandWrapper>
				<SVG src={Write} width={109} height={100} uniquifyIDs={true} />
			</HandWrapper>
		</Card>
	)
}

export default WriteMe
