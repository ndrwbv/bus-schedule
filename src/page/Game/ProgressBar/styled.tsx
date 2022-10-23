import styled from 'styled-components'

export const Cotainer = styled.div`
	height: 5px;
	width: 100%;
	background: rgba(0, 0, 0, 0.19);
	border-radius: 50;
	margin: 50;

	position: absolute;
	top: 0;
	left: 0;
`

export const Filler = styled.div<{ bgcolor: string }>`
	height: 100%;
	width: 0;
	background-color: ${props => props.bgcolor};
	border-radius: inherit;
	text-align: right;

	transition: width 0.3s ease-in-out;
`

export const Label = styled.span`
	padding: 5;
	color: white;
	font-weight: bold;
`
