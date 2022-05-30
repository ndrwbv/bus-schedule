import styled from 'styled-components'

export const ComplainsContainer = styled.div`
	font-weight: bold;
`

export const MessageContainer = styled.article`
	background: #e7edec;
	border-radius: 14px;
	padding: 11px 16px;
	text-align: left;
	display: grid;
	grid-template-columns: 1fr 1fr;
	grid-template-rows: 20px 20px;
	grid-row-gap: 5px;

	& + & {
		margin-top: 12px;
	}
`

export const MessageDate = styled.span`
	color: #737776;
	font-weight: 400;
	font-size: 12px;
	text-align: right;
`

export const ComplainsStop = styled.p<{ isCurrentStop?: boolean }>`
	color: ${props => (props.isCurrentStop ? '#1191FB' : 'black')};
`

export const ComplainsDirection = styled.p`
	text-align: right;
`
