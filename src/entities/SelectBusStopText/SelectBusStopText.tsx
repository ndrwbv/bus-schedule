import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const TextContainer = styled.p`
	opacity: 0.5;
	font-size: 18px;
`

export const SelectBusStopText = () => {
	const { t } = useTranslation()

	return <TextContainer>{t('Select bus stop to see schedule')}</TextContainer>
}
