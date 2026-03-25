import styled from 'styled-components'

export const ImageWrapperStyled = styled.div<{ $w: number; $h: number }>`
	width: ${props => `${props.$w}px`};
	height: ${props => `${props.$h}px`};
`
