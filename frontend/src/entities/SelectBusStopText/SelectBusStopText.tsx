import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const TextContainerStyled = styled.p`
	opacity: 0.5;
	font-size: 18px;
`

export const SelectBusStopText: React.FC = () => {
	const { t } = useTranslation()

	return <TextContainerStyled>{t(`Select bus stop to see schedule`)}</TextContainerStyled>
}
