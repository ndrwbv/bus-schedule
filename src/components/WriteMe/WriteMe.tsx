import SVG from 'react-inlinesvg'

import { Card, CardHeader } from 'components/common'

import Write from 'img/write.svg'
import TelegramButton from 'components/TelegramButton/TelegramButton'
import { useTranslation } from 'react-i18next'
import { HandWrapper } from './styled'

const WriteMe = () => {
	const { t } = useTranslation()

	return (
		<Card>
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
