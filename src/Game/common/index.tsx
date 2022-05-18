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

export const Title = styled.h1`
	font-size: 18px;
	text-align: center;
`

export const GameButton = styled.button`
	width: 100%;
	border-radius: 14px;
	background-color: green;
	padding: 20px;
`

export const GameLayout = styled.div`
	display: flex;
	flex-direction: column;
	height: 100%;
	padding: 32px;

	background-color: white;
`

export const GameLayoutCentred = styled(GameLayout)`
	justify-content: center;
`
