import { Link } from 'react-router-dom'
import styled from 'styled-components'

export const GameLink = styled(Link)<{ lowLight: boolean }>`
	color: #0364f6;
	text-decoration: underline;
	opacity: ${props => (props.lowLight ? '0.5' : '1')};
`

export const GameUIContainer = styled.div<{ marginBottom?: number }>`
	margin-bottom: ${props => (props.marginBottom ? `${props.marginBottom} px` : '32px')};
`
