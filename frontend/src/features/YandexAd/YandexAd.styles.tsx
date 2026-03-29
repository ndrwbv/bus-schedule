import styled from 'styled-components'

export const YandexAdContainerStyled = styled.div<{ $isLoaded: boolean }>`
	min-height: ${props => (props.$isLoaded ? `100px` : `0`)};
	overflow: hidden;
	border-radius: 25px;
	transition: min-height 0.3s ease;

	& > div {
		width: 100%;
	}
`
